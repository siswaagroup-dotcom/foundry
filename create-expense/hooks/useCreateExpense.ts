"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { currencies } from "../data/currencies";
import { expenseCategories } from "../data/expense-categories";
import { defaultExpenseForm, statusOptions } from "../data/expense-config";
import type {
  CreateExpenseForm,
  ExpenseStatus,
} from "../types/expense-types";

export function useCreateExpense() {
  const router = useRouter();
  const [formData, setFormData] =
    useState<CreateExpenseForm>(defaultExpenseForm);

  const validation = useMemo(
    () => ({
      amount: Number(formData.amount) >= 0 && formData.amount.trim() !== "",
      date: formData.date.trim().length > 0,
      vendor: formData.vendor.trim().length > 0,
      category: formData.category.trim().length > 0,
    }),
    [formData],
  );

  const updateField = useCallback(
    (field: keyof CreateExpenseForm, value: string) => {
      setFormData((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const selectStatus = useCallback((status: ExpenseStatus) => {
    setFormData((current) => ({
      ...current,
      status,
    }));
  }, []);

  const saveDraft = useCallback(() => {
    console.log(formData);
  }, [formData]);

  const createExpense = useCallback(() => {
    console.log(formData);
  }, [formData]);

  const cancel = useCallback(() => {
    router.push("/dashboard/expenses");
  }, [router]);

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
  };
}
