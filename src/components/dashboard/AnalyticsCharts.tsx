"use client";

import dynamic from "next/dynamic";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const AnalyticsChartsClient = dynamic(
  () =>
    import("./AnalyticsChartsClient").then(
      (module) => module.AnalyticsChartsClient,
    ),
  {
    ssr: false,
    loading: () => <AnalyticsChartsSkeleton />,
  },
);

function AnalyticsChartsSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {["Revenue Chart", "Task Completion Chart", "Team Productivity Chart"].map((title) => (
        <DashboardCard key={title} title={title}>
          <div className="h-60 animate-pulse rounded-xl bg-[#f3f4f6]" />
        </DashboardCard>
      ))}
    </div>
  );
}

export function AnalyticsCharts() {
  return <AnalyticsChartsClient />;
}
