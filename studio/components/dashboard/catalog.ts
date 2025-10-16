import type {
  DashboardWidgetType,
  DashboardWidget,
  DashboardDataBinding,
} from "@nesolagus/config";
import type { AccentKey } from "@nesolagus/dashboard-widgets";

export type WidgetVariant =
  | { type: "metric"; variant: "primary" | "delta" }
  | { type: "chart"; variant: "funnel" | "donut" | "bar" | "radial" }
  | { type: "table"; variant: "breakdown" }
  | { type: "text"; variant: "insight" };

export interface WidgetDescriptor {
  id: string;
  title: string;
  description: string;
  type: DashboardWidgetType;
  variant: WidgetVariant;
  defaultAccent?: AccentKey;
}

export const DASHBOARD_WIDGET_CATALOG: WidgetDescriptor[] = [
  {
    id: "metric-primary",
    type: "metric",
    title: "Headline KPI",
    description: "Large numeric stat with optional subtitle.",
    variant: { type: "metric", variant: "primary" },
    defaultAccent: "emerald",
  },
  {
    id: "metric-delta",
    type: "metric",
    title: "KPI with Delta",
    description: "Shows change up/down vs prior period.",
    variant: { type: "metric", variant: "delta" },
    defaultAccent: "amber",
  },
  {
    id: "chart-funnel",
    type: "chart",
    title: "Engagement Funnel",
    description: "Stage-based completion funnel.",
    variant: { type: "chart", variant: "funnel" },
    defaultAccent: "emerald",
  },
  {
    id: "chart-donut",
    type: "chart",
    title: "Segment Donut",
    description: "Segment share donut visualization.",
    variant: { type: "chart", variant: "donut" },
    defaultAccent: "violet",
  },
  {
    id: "chart-bar",
    type: "chart",
    title: "Comparison Bars",
    description: "Side-by-side bar chart for quick comparisons.",
    variant: { type: "chart", variant: "bar" },
    defaultAccent: "cyan",
  },
  {
    id: "chart-wheel",
    type: "chart",
    title: "Insight Wheel",
    description: "Radial view highlighting a single insight.",
    variant: { type: "chart", variant: "radial" },
    defaultAccent: "amber",
  },
  {
    id: "table-breakdown",
    type: "table",
    title: "Response Breakdown",
    description: "Tabular breakdown with percentages.",
    variant: { type: "table", variant: "breakdown" },
    defaultAccent: "neutral",
  },
  {
    id: "text-insight",
    type: "text",
    title: "Insight Card",
    description: "Narrative highlight with gradient frame.",
    variant: { type: "text", variant: "insight" },
    defaultAccent: "neutral",
  },
];

const textPlaceholder =
  "Use this space to add context, insights, or instructions for reviewers.";

export const createDefaultWidget = (
  descriptor: WidgetDescriptor,
  index = 0
): DashboardWidget => {
  const baseId = `widget-${Date.now()}-${index}`;
  const baseLayout = { x: (index % 3) * 4, y: Math.floor(index / 3) * 3, w: 4, h: 3 };
  const type = descriptor.type;

  switch (descriptor.variant.type) {
    case "metric":
      return {
        id: baseId,
        type,
        title: descriptor.title,
        layout: { ...baseLayout, w: 4, h: 3 },
        accent: descriptor.defaultAccent,
        data: {
          source: { kind: "metric", value: "completion_rate" },
          aggregation: "percentage",
        },
        presentation: {
          metric: {
            format: descriptor.variant.variant === "delta" ? "percentage" : "number",
          },
        },
        notes: descriptor.id,
      };
    case "chart": {
      const chartVariant = descriptor.variant.variant;
      return {
        id: baseId,
        type,
        title: descriptor.title,
        layout: { ...baseLayout, w: 6, h: 4 },
        accent: descriptor.defaultAccent,
        data: [
          {
            source: { kind: "question", value: "b0" },
            aggregation: "distribution",
          },
        ],
        presentation: {
          chart: {
            variant: chartVariant === "bar" ? "bar" : "pie",
            showLegend: chartVariant === "donut" || chartVariant === "radial",
          },
        },
        notes: descriptor.id,
      };
    }
    case "table":
      return {
        id: baseId,
        type,
        title: descriptor.title,
        layout: { ...baseLayout, w: 8, h: 5 },
        accent: descriptor.defaultAccent,
        data: {
          source: { kind: "question", value: "b0" },
          aggregation: "distribution",
        },
        presentation: {
          table: {
            columns: [
              { key: "label", label: "Label", width: 220, format: "text" },
              { key: "value", label: "Responses", width: 120, format: "number" },
              { key: "percentage", label: "%", width: 80, format: "percentage" },
            ],
          },
        },
        notes: descriptor.id,
      };
    case "text":
    default: {
      const emptyData: DashboardDataBinding[] = [];
      return {
        id: baseId,
        type: "text",
        title: descriptor.title,
        layout: baseLayout,
        accent: descriptor.defaultAccent,
        data: emptyData,
        presentation: {},
        content: textPlaceholder,
        notes: descriptor.id,
      };
    }
  }
};

export const ACCENT_OPTIONS: AccentKey[] = ["emerald", "cyan", "violet", "amber", "neutral"];

export function getDescriptorById(id: string | undefined): WidgetDescriptor | undefined {
  if (!id) return undefined;
  return DASHBOARD_WIDGET_CATALOG.find((item) => item.id === id);
}

export function getDescriptorForWidget(widget: DashboardWidget): WidgetDescriptor | undefined {
  return getDescriptorById(widget.notes) ?? DASHBOARD_WIDGET_CATALOG.find((item) => item.type === widget.type);
}
