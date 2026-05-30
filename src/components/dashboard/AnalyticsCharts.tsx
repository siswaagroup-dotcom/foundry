"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { productivityChart, revenueChart } from "@/lib/dashboard-data";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function AnalyticsCharts() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {["Revenue Chart", "Task Completion Chart", "Team Productivity Chart"].map(
          (title) => (
            <DashboardCard key={title} title={title}>
              <div className="h-60 animate-pulse rounded-xl bg-[#f3f4f6]" />
            </DashboardCard>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <DashboardCard title="Revenue Chart">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      <DashboardCard title="Task Completion Chart">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      <DashboardCard title="Team Productivity Chart">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivityChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="team" type="category" fontSize={12} width={58} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </div>
  );
}
