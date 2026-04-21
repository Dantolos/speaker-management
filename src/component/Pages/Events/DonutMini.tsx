"use client";

import { ResponsivePie } from "@nivo/pie";
import { useTranslations } from "next-intl";
import type { MetricBucket } from "@/services/speaker/dashboard";

const COLORS = [
  "#534AB7",
  "#7F77DD",
  "#CECBF6",
  "#1D9E75",
  "#5DCAA5",
  "#9FE1CB",
  "#D85A30",
  "#F0997B",
];

type Props = {
  data: MetricBucket[];
};

export default function DonutMini({ data }: Props) {
  const t = useTranslations("EventsOverview");

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-sm text-foreground/40">
        {t("metricsEmpty")}
      </div>
    );
  }

  const pieData = data.map((d, i) => ({
    id: d.label,
    label: d.label,
    value: d.count,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="h-[180px]">
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
        margin={{ top: 10, right: 100, bottom: 10, left: 10 }}
        legends={[
          {
            anchor: "right",
            direction: "column",
            translateX: 90,
            itemsSpacing: 4,
            itemWidth: 90,
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
