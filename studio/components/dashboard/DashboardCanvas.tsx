"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { DashboardWidget } from "@nesolagus/config";
import type { PreviewPayload } from "@/lib/dashboardPreview";
import type { SurveyContextCatalog } from "@/hooks/useSurveyContext";
import { CanvasWidgetPreview } from "./CanvasWidgetPreview";
import { cn } from "@/lib/utils";

type WidgetLayout = NonNullable<DashboardWidget["layout"]>;

interface DashboardCanvasProps {
  widgets: DashboardWidget[];
  selectedWidgetId: string | null;
  onSelect: (widgetId: string) => void;
  onLayoutChange?: (widgetId: string, layout: WidgetLayout) => void;
  previewData?: PreviewPayload | null;
  surveyContext?: SurveyContextCatalog;
  onRemoveWidget?: (widgetId: string) => void;
}

const GRID_COLUMNS = 12;
const GRID_GAP = 16;
const CELL_HEIGHT = 96;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Canvas surface for arranging dashboard widgets.
 * Supports drag-to-move and drag-to-resize interactions with grid snapping.
 */
export function DashboardCanvas({
  widgets,
  selectedWidgetId,
  onSelect,
  onLayoutChange,
  previewData,
  surveyContext,
  onRemoveWidget,
}: DashboardCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [columnWidth, setColumnWidth] = useState<number>(180);
  const [liveLayouts, setLiveLayouts] = useState<Record<string, WidgetLayout>>({});

  const measureColumns = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    const width = element.clientWidth;
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    const available = width - totalGap;
    if (available <= 0) return;
    const computed = available / GRID_COLUMNS;
    setColumnWidth((prev) => (Math.abs(prev - computed) > 1 ? computed : prev));
  }, []);

  useEffect(() => {
    measureColumns();
    window.addEventListener("resize", measureColumns);
    return () => window.removeEventListener("resize", measureColumns);
  }, [measureColumns]);

  useEffect(() => {
    setLiveLayouts((current) => {
      const validIds = new Set(widgets.map((widget) => widget.id));
      let mutated = false;
      const next: Record<string, WidgetLayout> = {};
      for (const id of Object.keys(current)) {
        if (validIds.has(id)) {
          next[id] = current[id];
        } else {
          mutated = true;
        }
      }
      return mutated ? next : current;
    });
  }, [widgets]);

  const effectiveLayouts = useMemo(() => {
    return widgets.map((widget, index) => {
      const fallback: WidgetLayout = widget.layout ?? {
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 3,
        w: 4,
        h: 3,
      };
      const layout = liveLayouts[widget.id] ?? widget.layout ?? fallback;
      return { widget, layout };
    });
  }, [widgets, liveLayouts]);

  const columnSpanPx = columnWidth + GRID_GAP;
  const rowSpanPx = CELL_HEIGHT + GRID_GAP;

  const totalRows = useMemo(() => {
    const maxRow = effectiveLayouts.reduce(
      (acc, item) => Math.max(acc, item.layout.y + item.layout.h),
      0
    );
    return Math.max(maxRow, 6);
  }, [effectiveLayouts]);

  const handleWidgetSelect = useCallback(
    (widgetId: string) => {
      onSelect(widgetId);
    },
    [onSelect]
  );

  const startInteraction = useCallback(
    (
      widgetId: string,
      layout: WidgetLayout,
      kind: "move" | "resize",
      event: ReactPointerEvent<HTMLDivElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();
      handleWidgetSelect(widgetId);
      const startPointer = { x: event.clientX, y: event.clientY };
      let latestLayout = layout;
      const initialLayout = { ...layout };
      const initialWidthPx =
        initialLayout.w * columnWidth + Math.max(0, initialLayout.w - 1) * GRID_GAP;
      const initialHeightPx =
        initialLayout.h * CELL_HEIGHT + Math.max(0, initialLayout.h - 1) * GRID_GAP;
      const previousUserSelect = document.body.style.userSelect;

      const handleMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        const deltaX = moveEvent.clientX - startPointer.x;
        const deltaY = moveEvent.clientY - startPointer.y;

        if (kind === "move") {
          const nextX = clamp(
            Math.round((initialLayout.x * columnSpanPx + deltaX) / columnSpanPx),
            0,
            GRID_COLUMNS - initialLayout.w
          );
          const nextY = Math.max(
            0,
            Math.round((initialLayout.y * rowSpanPx + deltaY) / rowSpanPx)
          );
          latestLayout = { ...initialLayout, x: nextX, y: nextY };
        } else {
          const widthCandidate = Math.round((initialWidthPx + deltaX) / columnSpanPx);
          const heightCandidate = Math.round((initialHeightPx + deltaY) / rowSpanPx);
          const nextW = clamp(widthCandidate, 1, GRID_COLUMNS - initialLayout.x);
          const nextH = Math.max(1, heightCandidate);
          latestLayout = { ...initialLayout, w: nextW, h: nextH };
        }

        setLiveLayouts((current) => ({
          ...current,
          [widgetId]: latestLayout,
        }));
      };

      const handleUp = () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
        setLiveLayouts((current) => {
          const { [widgetId]: _removed, ...rest } = current;
          return rest;
        });
        document.body.style.userSelect = previousUserSelect;
        if (
          onLayoutChange &&
          (latestLayout.x !== layout.x ||
            latestLayout.y !== layout.y ||
            latestLayout.w !== layout.w ||
            latestLayout.h !== layout.h)
        ) {
          onLayoutChange(widgetId, latestLayout);
        }
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
      document.body.style.userSelect = "none";
    },
    [columnSpanPx, columnWidth, handleWidgetSelect, onLayoutChange, rowSpanPx]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-blue-100 bg-slate-50/80 p-4 shadow-inner"
      style={{
        minHeight: `${totalRows * CELL_HEIGHT + Math.max(0, totalRows - 1) * GRID_GAP}px`,
        backgroundSize: `${columnSpanPx}px ${rowSpanPx}px`,
        backgroundImage:
          "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.1) 1px, transparent 1px)",
      }}
    >
      {effectiveLayouts.map(({ widget, layout }) => {
        const isSelected = widget.id === selectedWidgetId;
        const widthPx = layout.w * columnWidth + (layout.w - 1) * GRID_GAP;
        const heightPx = layout.h * CELL_HEIGHT + (layout.h - 1) * GRID_GAP;
        const leftPx = layout.x * columnSpanPx;
        const topPx = layout.y * rowSpanPx;

        return (
          <div
            key={widget.id}
            className={cn(
              "group absolute flex h-full w-full cursor-pointer select-none flex-col overflow-hidden rounded-2xl border bg-white shadow transition-shadow",
              isSelected
                ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                : "border-slate-200 hover:border-blue-300 hover:shadow-md"
            )}
            style={{
              width: `${widthPx}px`,
              height: `${heightPx}px`,
              transform: `translate(${leftPx}px, ${topPx}px)`,
            }}
            onClick={() => handleWidgetSelect(widget.id)}
            role="button"
            aria-pressed={isSelected}
          >
            <div
              className="flex cursor-grab items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 group-active:cursor-grabbing"
              onPointerDown={(event) => startInteraction(widget.id, layout, "move", event)}
            >
              <span className="truncate pr-2">{widget.title || "Untitled widget"}</span>
              <div className="flex items-center gap-2">
                {onRemoveWidget && (
                  <button
                    type="button"
                    className="hidden rounded-full border border-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500 transition hover:border-red-200 hover:bg-red-50 group-hover:inline-flex"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveWidget(widget.id);
                    }}
                  >
                    Remove
                  </button>
                )}
                <span className="text-[10px] font-medium text-slate-400">Drag</span>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden bg-white p-4">
              <CanvasWidgetPreview widget={widget} preview={previewData} surveyContext={surveyContext} />
              <div
                className="absolute bottom-2 right-2 h-4 w-4 cursor-se-resize rounded-sm border border-slate-200 bg-white/90 text-[10px] font-semibold uppercase text-slate-400 shadow-sm transition group-hover:border-blue-300 group-hover:text-blue-500"
                onPointerDown={(event) => startInteraction(widget.id, layout, "resize", event)}
              >
                <svg
                  viewBox="0 0 8 8"
                  className="h-full w-full opacity-60"
                  aria-hidden
                >
                  <path d="M0 8 L8 0 H6 L0 6z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
