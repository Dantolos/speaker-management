"use client";

import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { useTranslations } from "next-intl";
import type { EventMetrics, MetricBucket } from "@/services/speaker/dashboard";

// Farbpaletten pro Chart-Dimension
const COLORS_GENDER = ["#534AB7", "#7F77DD", "#CECBF6"];
const COLORS_CATEGORY = [
  "#1D9E75",
  "#5DCAA5",
  "#9FE1CB",
  "#534AB7",
  "#7F77DD",
  "#CECBF6",
  "#D85A30",
  "#F0997B",
  "#F5C4B3",
  "#FAECE7",
];
const COLOR_COUNTRY = "#D85A30";
const COLOR_LANGUAGE = "#D4537E";

type Props = {
  metrics: EventMetrics;
};

export default function EventMetricsCharts({ metrics }: Props) {
  const t = useTranslations("EventDetail");

  if (metrics.totalSpeakers === 0) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-background p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-2">
          {t("metricsHeading")}
        </h2>
        <p className="text-sm text-foreground/60">{t("metricsEmpty")}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-3">
        {t("metricsHeading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ChartCard title={t("metricGender")}>
          <DonutChart data={metrics.gender} colors={COLORS_GENDER} />
        </ChartCard>
        <ChartCard title={t("metricCategory")}>
          <TreemapChart data={metrics.category} colors={COLORS_CATEGORY} />
        </ChartCard>
        <ChartCard title={t("metricCountry")}>
          <BarChart data={metrics.country} color={COLOR_COUNTRY} />
        </ChartCard>
        <ChartCard
          title={t("metricLanguage")}
          subtitle={t("metricLanguageHint")}
        >
          <BarChart data={metrics.language} color={COLOR_LANGUAGE} />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-5">
      <p className="text-sm font-medium mb-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-foreground/50 mb-2">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Donut (Pie mit innerRadius)
// ─────────────────────────────────────────────────────────────────

function DonutChart({
  data,
  colors,
}: {
  data: MetricBucket[];
  colors: string[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const pieData = data.map((d, i) => ({
    id: d.label,
    label: d.label,
    value: d.count,
    color: colors[i % colors.length],
  }));

  return (
    <div className="h-[200px]">
      <ResponsivePie
        data={pieData}
        innerRadius={0.6}
        padAngle={1}
        cornerRadius={2}
        colors={{ datum: "data.color" }}
        borderWidth={0}
        enableArcLinkLabels={false}
        arcLabelsSkipAngle={15}
        arcLabelsTextColor="#ffffff"
        margin={{ top: 10, right: 90, bottom: 10, left: 10 }}
        legends={[
          {
            anchor: "right",
            direction: "column",
            translateX: 80,
            itemsSpacing: 4,
            itemWidth: 80,
            itemHeight: 16,
            symbolSize: 10,
            symbolShape: "square",
            itemTextColor: "#6b6b6b",
          },
        ]}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Horizontal Bar
// ─────────────────────────────────────────────────────────────────

function BarChart({ data, color }: { data: MetricBucket[]; color: string }) {
  if (data.length === 0) return <EmptyChart />;

  const barData = data.map((d) => ({
    label: d.label,
    value: d.count,
  }));

  const height = Math.max(180, data.length * 32 + 40);

  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveBar
        data={barData}
        keys={["value"]}
        indexBy="label"
        layout="horizontal"
        margin={{ top: 10, right: 30, bottom: 30, left: 100 }}
        padding={0.3}
        colors={color}
        borderRadius={2}
        enableGridY={false}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          tickValues: 5,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
        }}
        labelSkipWidth={16}
        labelTextColor="#ffffff"
        theme={{
          text: { fontSize: 11, fill: "#6b6b6b" },
          axis: {
            ticks: { text: { fontSize: 11, fill: "#6b6b6b" } },
          },
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Treemap
// ─────────────────────────────────────────────────────────────────

function TreemapChart({
  data,
  colors,
}: {
  data: MetricBucket[];
  colors: string[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const treeData = {
    name: "root",
    children: data.map((d, i) => ({
      name: d.label,
      value: d.count,
      color: colors[i % colors.length],
    })),
  };

  return (
    <div className="h-[220px]">
      <ResponsiveTreeMap
        data={treeData}
        identity="name"
        value="value"
        valueFormat=".0f"
        colors={{ datum: "data.color" }}
        nodeOpacity={1}
        borderWidth={1}
        borderColor="#ffffff"
        label={(node) => `${node.data.name} · ${node.formattedValue}`}
        labelSkipSize={14}
        labelTextColor="#ffffff"
        parentLabelSize={0}
        enableParentLabel={false}
      />
    </div>
  );
}

function EmptyChart() {
  const t = useTranslations("EventDetail");
  return (
    <div className="flex items-center justify-center h-[180px] text-sm text-foreground/40">
      {t("metricsEmptyChart")}
    </div>
  );
}
