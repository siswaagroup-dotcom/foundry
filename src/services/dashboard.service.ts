import { apiGet } from "@/lib/api-client";
import type { DashboardResponse } from "@/types/dashboard";

const BASE = "/api/dashboard";

export const fetchDashboard = (): Promise<DashboardResponse> => apiGet(BASE);
