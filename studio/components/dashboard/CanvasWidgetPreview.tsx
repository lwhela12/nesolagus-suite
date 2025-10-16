import React, { useMemo } from "react";
import type {
  DashboardWidget,
  DashboardTextWidget,
  DashboardDataBinding,
} from "@nesolagus/config";
import {
  KpiStatCard,
  FunnelChart,
  SegmentDonut,
  InsightHighlight,
} from "@nesolagus/dashboard-widgets";
import type { AccentKey } from "@nesolagus/dashboard-widgets";
import { getDescriptorForWidget } from "./catalog";
import type { AccentName } from "./palette";
import type { PreviewPayload, PreviewQuestionStat } from "@/lib/dashboardPreview";
import type { SurveyContextCatalog, InsightOption } from "@/hooks/useSurveyContext";

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

const SAMPLE_BAR = [
  { label: "Awareness", value: 74 },
  { label: "Consideration", value: 62 },
  { label: "Action", value: 48 },
];

const ACCENT_SWATCH: Record<string, string> = {
  emerald: "#059669",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  neutral: "#4b5563",
};

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
  }
  const fraction = Math.abs(h % 1000) / 1000;
  return fraction;
}

function deriveAccent(widget: DashboardWidget, fallback: AccentName = "emerald"): AccentKey {
  const accent = widget.accent as AccentName | undefined;
  return (accent ?? fallback) as AccentKey;
}

const BarChartPreview: React.FC<{ data: { label: string; value: number }[]; accent: AccentKey }> = ({ data, accent }) => {
  const color = ACCENT_SWATCH[accent] ?? ACCENT_SWATCH.emerald;
  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span className="truncate pr-2">{row.label}</span>
            <span className="font-semibold text-slate-900">{row.value.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.max(0, row.value))}%`,
                background: `linear-gradient(90deg, ${color}, ${color}CC)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

function asBinding(data: DashboardWidget["data"]): DashboardDataBinding | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return (data[0] as DashboardDataBinding | undefined) ?? null;
  }
  return data as DashboardDataBinding;
}

function findQuestionStat(
  widget: DashboardWidget,
  preview?: PreviewPayload | null,
  _surveyContext?: SurveyContextCatalog
): PreviewQuestionStat | null {
  if (!preview || !Array.isArray(preview.questionStats)) return null;
  const binding = asBinding(widget.data);
  const questionId =
    (binding?.source as { value?: string; ref?: string } | undefined)?.value ??
    (binding?.source as { ref?: string } | undefined)?.ref;
  if (!questionId) return null;
  return preview.questionStats.find((stat) => stat.questionId === questionId) ?? null;
}

function findInsight(
  widget: DashboardWidget,
  binding: DashboardDataBinding | null,
  surveyContext?: SurveyContextCatalog
): InsightOption | null {
  if (!binding || binding.source?.kind !== "variable") return null;
  if (!surveyContext || !Array.isArray(surveyContext.insights)) return null;
  const insightId = String((binding.source as { value?: string }).value ?? "");
  return surveyContext.insights.find((insight) => insight.id === insightId) ?? null;
}

function formatMetricValue(
  metricKey: string | undefined,
  preview: PreviewPayload | null | undefined,
  insight: InsightOption | null
) {
  if (insight) {
    const formattedValue =
      insight.metricFormat === "percentage"
        ? `${Math.round(insight.metricValue)}%`
        : insight.metricFormat === "currency"
        ? `$${Math.round(insight.metricValue).toLocaleString("en-US")}`
        : insight.metricValue.toLocaleString("en-US");
    return {
      value: formattedValue,
      subtitle: insight.metricLabel || insight.description,
    };
  }

  const summary = preview?.summary;
  if (!summary || !metricKey) return null;

  switch (metricKey) {
    case "completion_rate": {
      if (summary.totalResponses <= 0) return null;
      const percentage = (summary.completedResponses / summary.totalResponses) * 100;
      return {
        value: `${Math.round(percentage)}%`,
        subtitle: "Completion rate",
      };
    }
    case "total_responses":
      return {
        value: summary.totalResponses.toLocaleString("en-US"),
        subtitle: "Total responses recorded",
      };
    case "completed_responses":
      return {
        value: summary.completedResponses.toLocaleString("en-US"),
        subtitle: "Completed surveys",
      };
    case "avg_completion_time_minutes":
    case "avg_completion_time": {
      const minutes = summary.avgCompletionTime;
      return {
        value: `${minutes.toFixed(1)} min`,
        subtitle: "Average completion time",
      };
    }
    case "opt_in_rate": {
      return {
        value: `${Math.round(summary.demographicsOptInRate * 100)}%`,
        subtitle: "Opt-in for follow-up",
      };
    }
    case "avg_donation":
    case "donation_avg":
      return {
        value: `$${summary.avgDonation.toLocaleString("en-US")}`,
        subtitle: "Average donation",
      };
    default:
      return null;
  }
}

function toDistributionRows(stat: PreviewQuestionStat | null) {
  if (!stat) return null;
  return Object.entries(stat.answerDistribution).map(([label, info]) => ({
    label,
    percentage: Number.isFinite(info.percentage) ? info.percentage : 0,
    count: info.count,
  }));
}

interface CanvasWidgetPreviewProps {
  widget: DashboardWidget;
  preview?: PreviewPayload | null;
  surveyContext?: SurveyContextCatalog;
}

export const CanvasWidgetPreview: React.FC<CanvasWidgetPreviewProps> = ({ widget, preview, surveyContext }) => {
  const descriptor = getDescriptorForWidget(widget);

  const element = useMemo(() => {
    const accent = deriveAccent(widget, descriptor?.defaultAccent ?? "emerald");
    const variant = descriptor?.variant;
    const binding = asBinding(widget.data);

    switch (variant?.type) {
      case "metric": {
        const metricKey =
          binding?.source?.kind === "metric"
            ? ((binding?.source as { value?: string } | undefined)?.value ?? undefined)
            : undefined;
        const insight = findInsight(widget, binding, surveyContext);
        const metric = formatMetricValue(metricKey, preview, insight);
        if (metric) {
          return (
            <KpiStatCard
              title={widget.title || insight?.label || "Metric"}
              subtitle={widget.subtitle || metric.subtitle}
              value={metric.value}
              accent={accent}
            />
          );
        }

        const randomValue = Math.round((seededRandom(widget.id) + 0.3) * 1000);
        const formatted =
          variant.variant === "delta"
            ? `${Math.round((seededRandom(widget.id + "delta") + 0.2) * 100)}%`
            : randomValue.toLocaleString("en-US");

        return (
          <KpiStatCard
            title={widget.title}
            subtitle={widget.subtitle || "vs previous period"}
            value={formatted}
            accent={accent}
            delta={
              variant.variant === "delta"
                ? { value: "+12%", direction: "up", tone: "positive", label: "MoM" }
                : undefined
            }
          />
        );
      }
      case "chart": {
        const stat = findQuestionStat(widget, preview, surveyContext);
        const rows = toDistributionRows(stat);
        const insight = findInsight(widget, binding, surveyContext);

        if (variant.variant === "funnel") {
          if (rows && rows.length > 0) {
            return (
              <FunnelChart
                data={rows.map((row) => ({
                  label: row.label,
                  value: row.percentage,
                  hint: `${row.count.toLocaleString("en-US")} responses`,
                }))}
                accent={accent}
                valueFormat={(value) => `${Math.round(value)}%`}
              />
            );
          }

          return <FunnelChart data={SAMPLE_FUNNEL} accent={accent} valueFormat={(v) => `${v}%`} />;
        }

        if (variant.variant === "donut") {
          if (rows && rows.length > 0) {
            return (
              <SegmentDonut
                data={rows.map((row) => ({ label: row.label, value: row.percentage }))}
                accent={accent}
                totalLabel="Share"
                formatValue={(value) => `${value.toFixed(1)}%`}
              />
            );
          }

          return (
            <SegmentDonut
              data={SAMPLE_SEGMENTS}
              accent={accent}
              totalLabel="Responses"
              formatValue={(v) => `${v}%`}
            />
          );
        }

        if (variant.variant === "bar") {
          if (rows && rows.length > 0) {
            return <BarChartPreview data={rows.map((row) => ({ label: row.label, value: row.percentage }))} accent={accent} />;
          }
          return <BarChartPreview data={SAMPLE_BAR} accent={accent} />;
        }

        if (variant.variant === "radial") {
          if (insight) {
            const value = Math.max(0, Math.min(100, insight.metricValue));
            const data = [
              {
                label: insight.metricLabel || insight.label,
                value,
              },
              {
                label: "Remaining",
                value: Math.max(0, 100 - value),
              },
            ];
            return (
              <SegmentDonut
                data={data}
                accent={accent}
                totalLabel="100%"
                formatValue={(v) => `${v.toFixed(1)}%`}
              />
            );
          }
          if (rows && rows.length > 0) {
            return (
              <SegmentDonut
                data={rows.map((row) => ({ label: row.label, value: row.percentage }))}
                accent={accent}
                totalLabel="Share"
                formatValue={(value) => `${value.toFixed(1)}%`}
              />
            );
          }
          return (
            <SegmentDonut
              data={SAMPLE_SEGMENTS}
              accent={accent}
              totalLabel="Total"
              formatValue={(v) => `${v}%`}
            />
          );
        }

        return <FunnelChart data={SAMPLE_FUNNEL} accent={accent} valueFormat={(v) => `${v}%`} />;
      }
      case "table": {
        const stat = findQuestionStat(widget, preview, surveyContext);
        const rows = toDistributionRows(stat);

        if (rows && rows.length > 0) {
          return (
            <SegmentDonut
              data={rows.map((row) => ({ label: row.label, value: row.percentage }))}
              accent={accent}
              totalLabel="Share"
              formatValue={(value) => `${value.toFixed(1)}%`}
            />
          );
        }

        return (
          <SegmentDonut
            data={SAMPLE_SEGMENTS.map((segment) => ({
              ...segment,
              value: Math.round((segment.value / 32) * 100),
            }))}
            accent={accent}
            totalLabel="Share"
            formatValue={(v) => `${v}%`}
          />
        );
      }
      case "text": {
        const textWidget = widget as DashboardTextWidget;
        return (
          <InsightHighlight
            title={textWidget.title || "Insight highlight"}
            eyebrow={textWidget.subtitle || "Key Insight"}
            body={
              textWidget.content ||
              "Community connectors over-index in completion rate and willingness to engage in follow-up conversations."
            }
            footer={textWidget.description || "Auto-generated preview"}
            accent={accent}
          />
        );
      }
      default:
        return (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
            Preview unavailable for this widget type
          </div>
        );
    }
  }, [descriptor, preview, widget]);

  return <div className="w-full">{element}</div>;
};
