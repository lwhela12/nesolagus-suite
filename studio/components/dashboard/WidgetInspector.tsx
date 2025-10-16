"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown } from "lucide-react";
import type {
  DashboardWidget,
  DashboardTextWidget,
  DashboardWidgetType,
  DashboardDataBinding,
  DashboardAggregation,
} from "@nesolagus/config";
import {
  ACCENT_OPTIONS,
  createDefaultWidget,
  DASHBOARD_WIDGET_CATALOG,
  getDescriptorById,
  getDescriptorForWidget,
} from "./catalog";
import {
  KpiStatCard,
  FunnelChart,
  SegmentDonut,
  InsightHighlight,
} from "@nesolagus/dashboard-widgets";
import type { AccentKey } from "@nesolagus/dashboard-widgets";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SurveyContextCatalog, SurveySummaryMetric } from "@/hooks/useSurveyContext";

const descriptorOptionsByType: Record<DashboardWidgetType, string[]> = DASHBOARD_WIDGET_CATALOG.reduce(
  (acc, descriptor) => {
    acc[descriptor.type] = acc[descriptor.type] || [];
    acc[descriptor.type].push(descriptor.id);
    return acc;
  },
  {} as Record<DashboardWidgetType, string[]>
);

interface WidgetInspectorProps {
  widget: DashboardWidget;
  index: number;
  totalWidgets: number;
  onChange: (widget: DashboardWidget) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  surveyContext?: SurveyContextCatalog;
}

const widgetTypeOptions: DashboardWidgetType[] = ["metric", "chart", "table", "text"];

const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
  }
  const fraction = Math.abs(h % 1000) / 1000;
  return fraction;
};

const SAMPLE_FUNNEL = [
  { label: "Started", value: 82, hint: "All responses" },
  { label: "Halfway", value: 74, hint: "In-progress" },
  { label: "Completed", value: 61, hint: "Finished" },
  { label: "Share OK", value: 45, hint: "Consented" },
];

const SAMPLE_SEGMENTS = [
  { label: "Cultural Connectors", value: 32 },
  { label: "Creative Catalysts", value: 24 },
  { label: "Community Builders", value: 18 },
  { label: "Heritage Keepers", value: 15 },
];

export function WidgetInspector({
  widget,
  index,
  totalWidgets,
  onChange,
  onRemove,
  onMove,
  surveyContext,
}: WidgetInspectorProps) {
  const descriptor = getDescriptorForWidget(widget);
  const accentValue = (widget.accent as AccentKey) || descriptor?.defaultAccent || "emerald";
  const questionOptions = surveyContext?.questions ?? [];
  const metricOptions = surveyContext?.metrics ?? [];
  const insightOptions = surveyContext?.insights ?? [];

  const handleTitleChange = (value: string) => onChange({ ...widget, title: value });

  const handleDescriptorChange = (descriptorId: string) => {
    if (descriptorId === descriptor?.id) return;
    const nextDescriptor = getDescriptorById(descriptorId);
    if (!nextDescriptor) return;
    const replacement = createDefaultWidget(nextDescriptor, index);
    if (widget.accent) {
      replacement.accent = widget.accent as AccentKey;
    }
    onChange({ ...replacement, id: widget.id, layout: widget.layout });
  };

  const handleAccentChange = (accent: AccentKey) => {
    onChange({ ...widget, accent });
  };

  const handleLayoutChange = (dimension: "w" | "h", value: number) => {
    const next = {
      ...widget,
      layout: {
        ...widget.layout,
        [dimension]: Math.max(1, Math.min(24, value)),
      },
    };
    onChange(next);
  };

  const updatePrimaryBinding = (
    kind: "metric" | "question" | "variable",
    value: string,
    aggregation: DashboardAggregation
  ) => {
    const baseBinding: DashboardDataBinding = {
      source: { kind, value },
      aggregation,
    };

    let nextWidget: DashboardWidget = widget;
    if (Array.isArray(widget.data)) {
      const bindings = widget.data.length > 0 ? widget.data : [baseBinding];
      nextWidget = {
        ...widget,
        data: bindings.map((binding, idx) =>
          idx === 0
            ? {
                ...binding,
                source: { ...binding.source, kind, value },
                aggregation,
              }
            : binding
        ),
      };
    } else if (widget.data) {
      nextWidget = {
        ...widget,
        data: {
          ...widget.data,
          source: { ...widget.data.source, kind, value },
          aggregation,
        },
      };
    } else {
      nextWidget = { ...widget, data: baseBinding } as DashboardWidget;
    }

    onChange(nextWidget);
  };

  const handleMetricSelect = (selection: string) => {
    if (selection.startsWith("insight:")) {
      const insightId = selection.slice("insight:".length);
      updatePrimaryBinding("variable", insightId, "avg");
      return;
    }
    if (selection.startsWith("question:")) {
      const questionId = selection.slice("question:".length);
      updatePrimaryBinding("question", questionId, "distribution");
      return;
    }
    const metric = selection as SurveySummaryMetric;
    const aggregationMap: Partial<Record<SurveySummaryMetric, DashboardAggregation>> = {
      total_responses: "count",
      completed_responses: "count",
      completion_rate: "percentage",
      opt_in_rate: "percentage",
      avg_completion_time: "avg",
      avg_donation: "avg",
    };
    updatePrimaryBinding("metric", metric, aggregationMap[metric] ?? "avg");
  };

  const handleQuestionSelect = (questionId: string) => {
    updatePrimaryBinding("question", questionId, "distribution");
  };

  const sourceValue = Array.isArray(widget.data)
    ? widget.data[0]?.source?.value
    : widget.data?.source?.value;
  const sourceKind = Array.isArray(widget.data)
    ? widget.data[0]?.source?.kind
    : widget.data?.source?.kind;
  const metricSelectValue =
    sourceKind === "metric" && typeof sourceValue === "string"
      ? (sourceValue as string)
      : sourceKind === "variable" && typeof sourceValue === "string"
      ? `insight:${String(sourceValue)}`
      : sourceKind === "question" && typeof sourceValue === "string"
      ? `question:${String(sourceValue)}`
      : undefined;

  const previewElement = useMemo(() => {
    const accent = accentValue;
    const randomValue = Math.round((seededRandom(widget.id) + 0.3) * 1000);
    switch (descriptor?.variant.type) {
      case "metric":
        return (
          <KpiStatCard
            title={widget.title}
            value={`${randomValue}`}
            subtitle={widget.subtitle || "vs previous period"}
            accent={accent}
            delta={
              descriptor.variant.variant === "delta"
                ? {
                    value: "+12%",
                    direction: "up",
                    tone: "positive",
                    label: "vs last month",
                  }
                : undefined
            }
          />
        );
      case "chart":
        if (descriptor.variant.variant === "funnel") {
          return <FunnelChart data={SAMPLE_FUNNEL} accent={accent} valueFormat={(v) => `${v}%`} />;
        }
        if (descriptor.variant.variant === "donut") {
          return <SegmentDonut data={SAMPLE_SEGMENTS} accent={accent} totalLabel="Responses" />;
        }
        return <FunnelChart data={SAMPLE_FUNNEL} accent={accent} valueFormat={(v) => `${v}%`} />;
      case "table":
        return (
          <SegmentDonut
            data={SAMPLE_SEGMENTS}
            accent={accent}
            totalLabel="Total"
            formatValue={(v) => `${v}`}
          />
        );
      case "text":
        return (
          <InsightHighlight
            title={widget.title || "Insight"}
            body={
              (widget as DashboardTextWidget).content ||
              "Community connectors over-index in completion rate and willingness to share follow-up information."
            }
            accent={accent}
            eyebrow="Key Insight"
            footer="Auto-generated from survey results"
          />
        );
      default:
        return null;
    }
  }, [descriptor, widget.title, widget.subtitle, widget.type === "text" ? (widget as DashboardTextWidget).content : undefined, accentValue, widget.id]);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Widget Settings</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => onMove("up")}>
            <ArrowUp className="mr-1 h-3 w-3" /> Up
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={index === totalWidgets - 1}
            onClick={() => onMove("down")}
          >
            <ArrowDown className="mr-1 h-3 w-3" /> Down
          </Button>
          <Button variant="outline" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="widget-title">Title</Label>
          <Input
            id="widget-title"
            value={widget.title}
            onChange={(event) => handleTitleChange(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="widget-template">Widget Style</Label>
          <select
            id="widget-template"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={descriptor?.id ?? ''}
            onChange={(event) => handleDescriptorChange(event.target.value)}
          >
            <option value="" disabled>
              Select style…
            </option>
            {widgetTypeOptions.map((type) => (
              <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                {(descriptorOptionsByType[type] || []).map((id) => {
                  const optionDescriptor = getDescriptorById(id);
                  if (!optionDescriptor) return null;
                  return (
                    <option key={id} value={id}>
                      {optionDescriptor.title}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="widget-accent">Accent</Label>
          <select
            id="widget-accent"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={accentValue}
            onChange={(event) => handleAccentChange(event.target.value as AccentKey)}
          >
            {ACCENT_OPTIONS.map((accent) => (
              <option key={accent} value={accent}>
                {accent.charAt(0).toUpperCase() + accent.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="widget-width">Width</Label>
          <Input
            id="widget-width"
            type="number"
            value={widget.layout.w}
            onChange={(event) => handleLayoutChange("w", Number(event.target.value))}
            min={1}
            max={24}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="widget-height">Height</Label>
          <Input
            id="widget-height"
            type="number"
            value={widget.layout.h}
            onChange={(event) => handleLayoutChange("h", Number(event.target.value))}
            min={1}
            max={24}
          />
        </div>
      </div>

      {widget.type !== "text" ? (
        <div className="space-y-1.5">
          <Label htmlFor="widget-source">
            {descriptor?.variant.type === "metric"
              ? "Summary Metric or Insight"
              : descriptor?.variant.type === "chart" && descriptor.variant.variant === "radial"
              ? "Insight or Survey Question"
              : "Survey Question"}
          </Label>
          {descriptor?.variant.type === "metric" || (descriptor?.variant.type === "chart" && descriptor.variant.variant === "radial") ? (
            metricOptions.length > 0 || insightOptions.length > 0 ? (
              <Select value={metricSelectValue} onValueChange={(value) => handleMetricSelect(value)}>
                <SelectTrigger id="widget-source">
                  <SelectValue placeholder="Select a metric or insight…" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Survey metrics</SelectLabel>
                      {metricOptions.map((metric) => (
                        <SelectItem key={metric.id} value={metric.id}>
                          <div className="flex flex-col">
                            <span>{metric.label}</span>
                            <span className="text-xs text-muted-foreground">{metric.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {metricOptions.length > 0 && insightOptions.length > 0 && <SelectSeparator />}
                  {insightOptions.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Insights</SelectLabel>
                      {insightOptions.map((insight) => (
                        <SelectItem key={insight.id} value={`insight:${insight.id}`}>
                          <div className="flex flex-col">
                            <span>{insight.label}</span>
                            <span className="text-xs text-muted-foreground">{insight.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {descriptor?.variant.type === "chart" && descriptor.variant.variant === "radial" &&
                    questionOptions.length > 0 && (
                      <>
                        {(metricOptions.length > 0 || insightOptions.length > 0) && <SelectSeparator />}
                        <SelectGroup>
                          <SelectLabel>Survey questions</SelectLabel>
                          {questionOptions.map((question) => (
                            <SelectItem key={question.id} value={`question:${question.id}`}>
                              <div className="flex flex-col">
                                <span>{question.label}</span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {question.type.replace(/-/g, " ")}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                Summary metrics and insights will appear once sample data is available.
              </div>
            )
          ) : questionOptions.length > 0 ? (
            <Select
              value={
                sourceKind === "question" && typeof sourceValue === "string" ? (sourceValue as string) : undefined
              }
              onValueChange={handleQuestionSelect}
            >
              <SelectTrigger id="widget-source">
                <SelectValue placeholder="Select a question…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Survey questions</SelectLabel>
                  {questionOptions.map((question) => (
                    <SelectItem key={question.id} value={question.id}>
                      <div className="flex flex-col">
                        <span>{question.label}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {question.type.replace(/-/g, " ")}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Only choice-based questions are available for charts today.
                </div>
              </SelectContent>
            </Select>
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              Add choice-based questions to the survey to make them available here.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="widget-content">Content</Label>
          <Textarea
            id="widget-content"
            value={(widget as DashboardTextWidget).content || ""}
            rows={4}
            onChange={(event) => onChange({ ...widget, content: event.target.value } as DashboardWidget)}
          />
        </div>
      )}

      <Separator className="my-2" />

      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">Preview</span>
          <Badge variant="outline">Sandbox Data</Badge>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          {previewElement ?? (
            <span className="text-sm text-gray-500">Preview not available for this widget.</span>
          )}
        </div>
      </div>
    </div>
  );
}
