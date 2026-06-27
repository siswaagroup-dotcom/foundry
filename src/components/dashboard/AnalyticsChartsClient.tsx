"use client";

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

import { DashboardCard } from "@/components/dashboard/DashboardCard";

type AnalyticsChartsClientProps = {
  revenue: Array<{ month: string; revenue: number; expenses: number; tasks: number }>;
  productivity: Array<{ team: string; value: number }>;
};

export function AnalyticsChartsClient({
  revenue,
  productivity,
}: AnalyticsChartsClientProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <DashboardCard title="Revenue Chart">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      <DashboardCard title="Task Completion Chart">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue}>
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
            <BarChart data={productivity} layout="vertical">
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
