"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpensesFilters } from "@/components/expenses/ExpensesFilters";
import { ExpensesHeader } from "@/components/expenses/ExpensesHeader";
import { ExpensesSummary } from "@/components/expenses/ExpensesSummary";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { SavedFilters } from "@/components/expenses/SavedFilters";
import { useExpenseList } from "@/hooks/useExpenses";
import type { ExpenseFilters } from "@/types/expense";

// Saved filter → API filter mappings
const savedFilterMap: Record<string, Partial<ExpenseFilters>> = {
  "Over Budget Expenses": { amountMin: 10000 },
  "Pending Approvals":    { status: "pending" },
  "Marketing Only":       { category: "Marketing" },
  "This Quarter":         {},
  "High Value ($10k+)":   { amountMin: 10000 },
};

const savedFilterNames = Object.keys(savedFilterMap);

const defaultFilters: ExpenseFilters = {};

export default function ExpensesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [activeSavedFilter, setActiveSavedFilter] = useState("");

  const { data: expenses = [], isLoading } = useExpenseList(filters);

  // Summary stats derived from API data
  const summaryExpenses = useMemo(() =>
    expenses.map((e) => ({
      id:       e.id,
      name:     e.name,
      detail:   e.detail ?? "",
      category: e.category,
      date:     new Date(e.expenseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status:   capitalise(e.status) as "Planned" | "Incurred" | "Approved" | "Pending",
      planned:  e.amountPlanned,
      incurred: e.amountIncurred,
    })), [expenses]);

  const selectSavedFilter = useCallback((filter: string) => {
    setActiveSavedFilter(filter);
    setFilters({ ...defaultFilters, ...(savedFilterMap[filter] ?? {}) });
  }, []);

  const changeFilters = useCallback((next: ExpenseFilters) => {
    setFilters(next);
    setActiveSavedFilter("");
  }, []);

  const createExpense = useCallback(() => router.push("/dashboard/expenses/create"), [router]);
  const selectExpense = useCallback(
    (expense: { id: string }) => router.push(`/dashboard/expenses/${expense.id}`), [router]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <ExpensesHeader onCreateExpense={createExpense} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          <ExpensesFilters filters={legacyFilters(filters)} onChange={(lf) => changeFilters(fromLegacy(lf))} />

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : (
            <>
              <ExpensesSummary expenses={summaryExpenses} />
              <ExpensesTable expenses={summaryExpenses} onSelectExpense={selectExpense} />
            </>
          )}
        </div>

        <SavedFilters
          activeFilter={activeSavedFilter}
          onSelect={selectSavedFilter}
          savedFilters={savedFilterNames}
        />
      </div>
    </div>
  );
}

// ─── Helpers — bridge legacy filter shape to new ExpenseFilters ───────────────

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function legacyFilters(f: ExpenseFilters) {
  return {
    status:      f.status ? capitalise(f.status) : "All Expenses",
    category:    f.category ?? "All Categories",
    dateRange:   "This Month",
    amountRange: f.amountMin !== undefined ? "$10k+" : "All Amounts",
  };
}

function fromLegacy(lf: { status: string; category: string; dateRange: string; amountRange: string }): ExpenseFilters {
  const f: ExpenseFilters = {};
  if (lf.status !== "All Expenses") f.status = lf.status.toLowerCase() as ExpenseFilters["status"];
  if (lf.category !== "All Categories") f.category = lf.category;
  if (lf.amountRange === "Under $5k")   { f.amountMin = 0; f.amountMax = 4999; }
  if (lf.amountRange === "$5k - $10k")  { f.amountMin = 5000; f.amountMax = 9999; }
  if (lf.amountRange === "$10k+")       { f.amountMin = 10000; }
  return f;
}
