"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchExpense } from "@/services/expense.service";

export const expenseDetailKey = (id: string) => ["expenses", "detail", id] as const;

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseDetailKey(id),
    queryFn:  () => fetchExpense(id),
    enabled:  Boolean(id),
    staleTime: 30_000,
  });
}
