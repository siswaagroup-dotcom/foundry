// =============================================================================
// EXPENSE SERVICE — client-side fetch wrapper
// =============================================================================
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Expense, ExpenseFilters, CreateExpenseInput,
  UpdateExpenseInput, ApproveExpenseInput, CreateExpenseAttachmentInput,
} from "@/types/expense";

export type { Expense, ExpenseFilters, CreateExpenseInput, UpdateExpenseInput, ApproveExpenseInput, CreateExpenseAttachmentInput };
export type { ExpenseStatus, ApprovalStage } from "@/types/expense";

export interface ExpenseAnalytics {
  totalPlanned:    number;
  totalIncurred:   number;
  totalApproved:   number;
  totalRejected:   number;
  totalPending:    number;
  byCategory:      { category: string; total: number }[];
  byStatus:        { status: string; count: number; total: number }[];
  recentApprovals: { expenseName: string; approverName: string; stage: string; actionedAt: string }[];
}

const BASE = "/api/expenses";

function buildQuery(f: ExpenseFilters = {}): string {
  const p = new URLSearchParams();
  if (f.status && f.status !== "all") p.set("status", f.status);
  if (f.category)   p.set("category",  f.category);
  if (f.search)     p.set("search",    f.search);
  if (f.ownerId)    p.set("ownerId",   f.ownerId);
  if (f.dateFrom)   p.set("dateFrom",  f.dateFrom);
  if (f.dateTo)     p.set("dateTo",    f.dateTo);
  if (f.amountMin !== undefined) p.set("amountMin", String(f.amountMin));
  if (f.amountMax !== undefined) p.set("amountMax", String(f.amountMax));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export const fetchExpenses        = (f?: ExpenseFilters): Promise<Expense[]>    => apiGet(`${BASE}${buildQuery(f)}`);
export const fetchExpense         = (id: string): Promise<Expense>              => apiGet(`${BASE}/${id}`);
export const createExpense        = (input: CreateExpenseInput): Promise<Expense> => apiPost(BASE, input);
export const updateExpense        = (id: string, input: UpdateExpenseInput): Promise<Expense> => apiPatch(`${BASE}/${id}`, input);
export const deleteExpenseById    = (id: string): Promise<{ id: string }>       => apiDelete(`${BASE}/${id}`);
export const approveExpense       = (id: string, input: ApproveExpenseInput): Promise<Expense> => apiPost(`${BASE}/${id}/approve`, input);
export const addExpenseAttachment = (id: string, input: CreateExpenseAttachmentInput): Promise<Expense> => apiPost(`${BASE}/${id}/attachments`, input);
export const fetchPendingApprovals = (): Promise<Expense[]>                     => apiGet(`${BASE}/pending-approvals`);
export const fetchExpenseAnalytics = (): Promise<ExpenseAnalytics>              => apiGet(`${BASE}/analytics`);
