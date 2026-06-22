"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveExpense, createExpense, deleteExpenseById,
  fetchExpenses, fetchPendingApprovals, updateExpense,
  type ApproveExpenseInput, type CreateExpenseInput,
  type Expense, type ExpenseFilters, type UpdateExpenseInput,
} from "@/services/expense.service";

export const EXPENSES_KEY = ["expenses"] as const;
const expenseKeys = (f: ExpenseFilters = {}) => [...EXPENSES_KEY, f] as const;
const pendingKey  = ["expenses", "pending-approvals"] as const;

// ─── useExpenseList ───────────────────────────────────────────────────────────
export function useExpenseList(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey:  expenseKeys(filters),
    queryFn:   () => fetchExpenses(filters),
    staleTime: 30_000,
  });
}

// ─── usePendingApprovals ──────────────────────────────────────────────────────
export function usePendingApprovals() {
  return useQuery({
    queryKey:  pendingKey,
    queryFn:   fetchPendingApprovals,
    staleTime: 30_000,
  });
}

// ─── useCreateExpense ─────────────────────────────────────────────────────────
export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess:  () => qc.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

// ─── useUpdateExpense ─────────────────────────────────────────────────────────
export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseInput }) =>
      updateExpense(id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: EXPENSES_KEY });
      const prev = qc.getQueriesData<Expense[]>({ queryKey: EXPENSES_KEY });
      qc.setQueriesData<Expense[]>({ queryKey: EXPENSES_KEY }, (old) =>
        old?.map((e) => e.id === id ? { ...e, ...input } : e) ?? old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([k, d]) => qc.setQueryData(k, d));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

// ─── useDeleteExpense ─────────────────────────────────────────────────────────
export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpenseById(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: EXPENSES_KEY });
      const prev = qc.getQueriesData<Expense[]>({ queryKey: EXPENSES_KEY });
      qc.setQueriesData<Expense[]>({ queryKey: EXPENSES_KEY }, (old) =>
        old?.filter((e) => e.id !== id) ?? old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([k, d]) => qc.setQueryData(k, d));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

// ─── useApproveExpense ────────────────────────────────────────────────────────
export function useApproveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApproveExpenseInput }) =>
      approveExpense(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSES_KEY });
      qc.invalidateQueries({ queryKey: pendingKey });
    },
  });
}
