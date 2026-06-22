"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

export type ReportTab = "overview" | "financial" | "crm" | "team" | "expenses";

function fetchReport<T>(tab: ReportTab): Promise<T> {
  return apiGet<T>(`/api/reports?tab=${tab}`);
}

// ─── Overview ─────────────────────────────────────────────────────────────────
export interface OverviewData {
  revenue:              number;
  expenses:             number;
  profit:               number;
  totalClients:         number;
  activeClients:        number;
  leads:                number;
  teamMembers:          number;
  totalTasks:           number;
  tasksDone:            number;
  tasksPending:         number;
  totalExpensesPlanned: number;
  pendingExpenses:      number;
}

export function useOverviewReport() {
  return useQuery({
    queryKey:  ["reports", "overview"],
    queryFn:   () => fetchReport<OverviewData>("overview"),
    staleTime: 60_000,
  });
}

// ─── Financial ────────────────────────────────────────────────────────────────
export interface FinancialData {
  byCategory:        { category: string; total: number; count: number }[];
  byClient:          { clientName: string; revenue: number; expenses: number }[];
  outstandingAmount: number;
}

export function useFinancialReport() {
  return useQuery({
    queryKey:  ["reports", "financial"],
    queryFn:   () => fetchReport<FinancialData>("financial"),
    staleTime: 60_000,
  });
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
export interface CrmReportData {
  pipelineByStage: { stage: string; count: number; totalQuoted: number }[];
  totalQuoted:     number;
  totalPaid:       number;
  totalAdvance:    number;
}

export function useCrmReport() {
  return useQuery({
    queryKey:  ["reports", "crm"],
    queryFn:   () => fetchReport<CrmReportData>("crm"),
    staleTime: 60_000,
  });
}

// ─── Team ─────────────────────────────────────────────────────────────────────
export interface TeamReportData {
  members: {
    name:           string;
    role:           string;
    tasksTotal:     number;
    tasksDone:      number;
    tasksPending:   number;
    completionRate: number;
  }[];
  totalTasks:     number;
  totalCompleted: number;
}

export function useTeamReport() {
  return useQuery({
    queryKey:  ["reports", "team"],
    queryFn:   () => fetchReport<TeamReportData>("team"),
    staleTime: 60_000,
  });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export interface ExpensesReportData {
  byStatus:   { status: string; count: number; total: number }[];
  byCategory: { category: string; count: number; planned: number; incurred: number }[];
}

export function useExpensesReport() {
  return useQuery({
    queryKey:  ["reports", "expenses"],
    queryFn:   () => fetchReport<ExpensesReportData>("expenses"),
    staleTime: 60_000,
  });
}
