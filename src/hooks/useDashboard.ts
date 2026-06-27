"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/services/dashboard.service";
import type { DashboardResponse } from "@/types/dashboard";

export const DASHBOARD_KEY = ["dashboard"] as const;

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: DASHBOARD_KEY,
    queryFn: fetchDashboard,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
