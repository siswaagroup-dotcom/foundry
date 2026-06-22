"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpensesFilters } from "@/components/expenses/ExpensesFilters";
import { ExpensesHeader } from "@/components/expenses/ExpensesHeader";
import { ExpensesSummary } from "@/components/expenses/ExpensesSummary";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { SavedFilters } from "@/components/expenses/SavedFilters";
import { useExpenseList } from "@/hooks/useExpenses";
import type { ExpenseFilters } from "@/types/expense";

const savedFilterMap: Record<string, Partial<ExpenseFilters>> = {
  "Over Budget Expenses": { amountMin: 10000 },
  "Pending Approvals":    { status: "pending" },
  "Marketing Only":       { category: "Marketing" },
  "This Quarter":         {},
  "High Value ($10k+)":   { amountMin: 10000 },
};

export default function ExpensesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [activeSavedFilter, setActiveSavedFilter] = useState("");

  const { data: expenses = [], isLoading } = useExpenseList(filters);

  const selectSavedFilter = useCallback((filter: string) => {
    setActiveSavedFilter(filter);
    setFilters({ ...(savedFilterMap[filter] ?? {}) });
  }, []);

  const changeFilters = useCallback((next: ExpenseFilters) => {
    setFilters(next);
    setActiveSavedFilter("");
  }, []);

  const createExpense = useCallback(() => router.push("/dashboard/expenses/create"), [router]);
  const selectExpense = useCallback(
    (expense: { id: string }) => router.push(`/dashboard/expenses/${expense.id}`), [router]
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <ExpensesHeader onCreateExpense={createExpense} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          <ExpensesFilters filters={filters} onChange={changeFilters} />

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <>
              <ExpensesSummary expenses={expenses} />
              <ExpensesTable expenses={expenses} onSelectExpense={selectExpense} />
            </>
          )}
        </div>

        <SavedFilters
          activeFilter={activeSavedFilter}
          onSelect={selectSavedFilter}
          savedFilters={Object.keys(savedFilterMap)}
        />
      </div>
    </div>
  );
}
