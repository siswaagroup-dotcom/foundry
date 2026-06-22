"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useCreateExpense as useCreateExpenseMutation } from "@/hooks/useExpenses";
import { currencies } from "../data/currencies";
import { expenseCategories } from "../data/expense-categories";
import { defaultExpenseForm, statusOptions } from "../data/expense-config";
import type { CreateExpenseForm, ExpenseStatus } from "../types/expense-types";

export function useCreateExpense() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateExpenseMutation();
  const [formData, setFormData] = useState<CreateExpenseForm>(defaultExpenseForm);

  const validation = useMemo(() => ({
    amount:   Number(formData.amount) >= 0 && formData.amount.trim() !== "",
    date:     formData.date.trim().length > 0,
    vendor:   formData.vendor.trim().length > 0,
    category: formData.category.trim().length > 0,
  }), [formData]);

  const updateField = useCallback(
    (field: keyof CreateExpenseForm, value: string) =>
      setFormData((c) => ({ ...c, [field]: value })),
    []
  );

  const selectStatus = useCallback((status: ExpenseStatus) =>
    setFormData((c) => ({ ...c, status })), []);

  // Parse date from DD-MM-YYYY or any format to ISO
  function parseDate(raw: string): string {
    const parts = raw.split(/[-/]/);
    if (parts.length === 3) {
      const [a, b, c] = parts;
      // DD-MM-YYYY → YYYY-MM-DD
      if (a.length === 2 && c.length === 4) return `${c}-${b}-${a}`;
      // YYYY-MM-DD already
      if (a.length === 4) return raw;
    }
    return raw;
  }

  const saveDraft = useCallback(async () => {
    try {
      await createMutation.mutateAsync({
        name:          formData.vendor.trim() || "Draft Expense",
        category:      formData.category || "Operations",
        vendor:        formData.vendor.trim() || undefined,
        currency:      formData.currency,
        amountPlanned: parseFloat(formData.amount) || 0,
        status:        "planned",
        expenseDate:   parseDate(formData.date),
      });
      toast({ title: "Draft saved", variant: "success" });
      router.push("/dashboard/expenses");
    } catch (err) {
      toast({ title: "Failed to save draft", description: err instanceof Error ? err.message : "Try again", variant: "error" });
    }
  }, [formData, createMutation, toast, router]);

  const createExpense = useCallback(async () => {
    if (!validation.category) { toast({ title: "Category is required", variant: "error" }); return; }
    if (!validation.date)     { toast({ title: "Date is required",     variant: "error" }); return; }
    try {
      await createMutation.mutateAsync({
        name:          formData.vendor.trim() || formData.category,
        detail:        undefined,
        category:      formData.category,
        vendor:        formData.vendor.trim() || undefined,
        currency:      formData.currency,
        amountPlanned: parseFloat(formData.amount) || 0,
        status:        formData.status.toLowerCase() as "planned" | "incurred",
        expenseDate:   parseDate(formData.date),
      });
      toast({ title: "Expense created", variant: "success" });
      router.push("/dashboard/expenses");
    } catch (err) {
      toast({ title: "Failed to create expense", description: err instanceof Error ? err.message : "Try again", variant: "error" });
    }
  }, [formData, validation, createMutation, toast, router]);

  const cancel = useCallback(() => router.push("/dashboard/expenses"), [router]);

  return {
    formData,
    validation,
    statusOptions,
    currencies,
    categories: expenseCategories,
    updateField,
    selectStatus,
    saveDraft,
    createExpense,
    cancel,
    isLoading: createMutation.isPending,
  };
}
