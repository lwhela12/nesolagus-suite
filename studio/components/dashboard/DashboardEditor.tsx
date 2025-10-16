"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, LayoutDashboard, Sparkles, Trash2, Maximize2 } from "lucide-react";
import type { DashboardConfig, DashboardWidget } from "@nesolagus/config";
import { DASHBOARD_WIDGET_CATALOG, createDefaultWidget } from "./catalog";
import type { WidgetDescriptor } from "./catalog";
import { WidgetInspector } from "./WidgetInspector";
import { DashboardCanvas } from "./DashboardCanvas";
import { useDashboardPreview } from "@/hooks/useDashboardPreview";
import { Loader2 } from "lucide-react";
import { extractQuestionDefinitions } from "@/lib/dashboardPreview";
import { useSurveyContext } from "@/hooks/useSurveyContext";

interface DashboardEditorProps {
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
  onOpenFullScreen?: () => void;
  isSaving?: boolean;
  draftId?: string;
  surveyConfig?: any;
}

const widgetCatalog = DASHBOARD_WIDGET_CATALOG;

/**
 * Lightweight placeholder component for the dashboard builder.
 * Provides a summary view and hook for launching the full-screen editor.
 * Detailed widget editing is implemented in later phases.
 */
export function DashboardEditor({
  config,
  onChange,
  onOpenFullScreen,
  isSaving,
  draftId,
  surveyConfig,
}: DashboardEditorProps) {
  const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);
  const widgets = useMemo(() => localConfig.widgets ?? [], [localConfig.widgets]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(widgets[0]?.id || null);
  const { preview, isLoading: previewLoading, error: previewError, seedPreview, clearPreview } =
    useDashboardPreview(draftId);
  const questionDefinitions = useMemo(() => {
    const definitions = extractQuestionDefinitions(surveyConfig);
    if (definitions.length > 0) {
      return definitions;
    }
    if (preview?.questionStats) {
      return preview.questionStats.map((stat) => ({
        id: stat.questionId,
        type: stat.questionType as any,
        text: stat.questionText,
        options: Object.keys(stat.answerDistribution ?? {}),
      }));
    }
    return [];
  }, [surveyConfig, preview]);
  const surveyContext = useSurveyContext(questionDefinitions, preview ?? null);

  useEffect(() => {
    setLocalConfig(config);
    if (config.widgets && config.widgets.length > 0) {
      setSelectedWidgetId((prev) => prev && config.widgets?.some((w) => w.id === prev) ? prev : config.widgets[0].id);
    } else {
      setSelectedWidgetId(null);
    }
  }, [config]);

  const commitUpdate = (updated: DashboardConfig) => {
    setLocalConfig(updated);
    onChange(updated);
  };

  const handleAddWidget = (descriptor: WidgetDescriptor) => {
    const draftWidgets = widgets ?? [];
    const newWidget = createDefaultWidget(descriptor, draftWidgets.length);
    const updated: DashboardConfig = {
      ...localConfig,
      widgets: [...draftWidgets, newWidget],
    };
    commitUpdate(updated);
    setSelectedWidgetId(newWidget.id);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updated: DashboardConfig = {
      ...localConfig,
      widgets: widgets.filter((widget) => widget.id !== widgetId),
    };
    commitUpdate(updated);
    if (selectedWidgetId === widgetId) {
      const remaining = updated.widgets || [];
      setSelectedWidgetId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleWidgetChange = (widgetId: string, updatedWidget: DashboardWidget) => {
    const updatedWidgets = widgets.map((widget) => (widget.id === widgetId ? updatedWidget : widget));
    commitUpdate({ ...localConfig, widgets: updatedWidgets });
  };

  const handleWidgetLayoutChange = (widgetId: string, layout: DashboardWidget["layout"]) => {
    const updatedWidgets = widgets.map((widget) =>
      widget.id === widgetId
        ? {
            ...widget,
            layout: {
              ...widget.layout,
              ...layout,
            },
          }
        : widget
    );
    commitUpdate({ ...localConfig, widgets: updatedWidgets });
  };

  const handleMoveWidget = (widgetId: string, direction: "up" | "down") => {
    const index = widgets.findIndex((widget) => widget.id === widgetId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const reordered = [...widgets];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, removed);

    const normalized = reordered.map((widget, idx) => ({
      ...widget,
      layout: {
        ...widget.layout,
        y: Math.floor(idx / 3) * 3,
      },
    }));

    commitUpdate({ ...localConfig, widgets: normalized });
    setSelectedWidgetId(widgetId);
  };

  const selectedWidget = widgets.find((widget) => widget.id === selectedWidgetId) || null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Dashboard Canvas</CardTitle>
                <CardDescription>
                  Drop widgets onto the canvas, then fine-tune layout and data in the inspector.
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{widgets.length} widgets</Badge>
            {previewLoading ? (
              <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" /> Updating preview…
              </span>
            ) : preview ? (
              <Badge variant="outline" className="text-xs">
                Sample data • {new Date(preview.generatedAt ?? Date.now()).toLocaleDateString()}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-gray-500">
                Preview data not generated
              </Badge>
            )}
            {isSaving && <span className="text-xs font-medium text-blue-600">Saving…</span>}
            {onOpenFullScreen && (
              <Button variant="outline" size="sm" onClick={onOpenFullScreen}>
                <Maximize2 className="mr-2 h-4 w-4" />
                Full Screen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm">
            <Button
              size="sm"
              className="gap-2"
              variant="default"
              onClick={seedPreview}
              disabled={previewLoading || !draftId}
            >
              <Sparkles className="h-4 w-4" />
              Generate sample data
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearPreview}
              disabled={previewLoading || !preview || !draftId}
            >
              Clear sample data
            </Button>
            {previewError && <span className="text-xs text-red-500">{previewError}</span>}
            {!draftId && (
              <span className="text-xs text-gray-500">
                Save the draft before generating preview data.
              </span>
            )}
          </div>
          <div className="relative grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
            <div className="space-y-3">
              <Card className="sticky top-4 border border-gray-200/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Widget Templates
                  </CardTitle>
                  <CardDescription>Select a template to add, then arrange it on the canvas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {widgetCatalog.map((item) => (
                    <button
                      key={item.id}
                      className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
                      onClick={() => handleAddWidget(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.variant.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="relative rounded-3xl border border-dashed border-gray-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-inner">
              <div className="absolute inset-0 pointer-events-none rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_45%)]" />
              <div className="absolute inset-0 pointer-events-none rounded-3xl bg-[linear-gradient(135deg,_rgba(59,130,246,0.08),_transparent_55%)]" />

              {widgets.length === 0 ? (
                <div className="relative z-10 flex flex-col items-center justify-center border border-dashed border-blue-300 rounded-2xl p-16 text-center bg-white/60 backdrop-blur-sm">
                  <LayoutDashboard className="h-12 w-12 text-blue-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Design your dashboard</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Drop widgets from the left to start crafting a dashboard experience. You can move and resize widgets directly on the canvas.
                  </p>
                  <Button onClick={() => handleAddWidget(widgetCatalog[0])} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add first widget
                  </Button>
                </div>
              ) : (
                <div className="relative z-10 space-y-3">
                  {widgets.length > 0 && (
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-gray-500">
                        Drag to arrange. Hover a tile to remove.
                      </span>
                    </div>
                  )}
                  <DashboardCanvas
                    widgets={widgets}
                    selectedWidgetId={selectedWidgetId}
                    onSelect={(id) => setSelectedWidgetId(id)}
                    onLayoutChange={handleWidgetLayoutChange}
                    previewData={preview ?? null}
                    surveyContext={surveyContext}
                    onRemoveWidget={handleRemoveWidget}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedWidget && (
        <Card>
          <CardContent>
            <WidgetInspector
              widget={selectedWidget}
              index={widgets.findIndex((widget) => widget.id === selectedWidget.id)}
              totalWidgets={widgets.length}
              onChange={(updatedWidget) => handleWidgetChange(selectedWidget.id, updatedWidget)}
              onRemove={() => handleRemoveWidget(selectedWidget.id)}
              onMove={(direction) => handleMoveWidget(selectedWidget.id, direction)}
              surveyContext={surveyContext}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
