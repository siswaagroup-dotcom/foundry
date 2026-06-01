"use client";

import { useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExpensesFilters } from "@/components/expenses/ExpensesFilters";
import { ExpensesHeader } from "@/components/expenses/ExpensesHeader";
import { ExpensesSummary } from "@/components/expenses/ExpensesSummary";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { SavedFilters } from "@/components/expenses/SavedFilters";

import { expenses } from "@/data/expenses";
import type { ExpenseFilters } from "@/types/expense";

const defaultFilters: ExpenseFilters = {
  status: "All Expenses",
  category: "All Categories",
  dateRange: "This Month",
  amountRange: "All Amounts",
};

const savedFilterMap: Record<
  string,
  Partial<ExpenseFilters>
> = {
  "Over Budget Expenses": {
    amountRange: "$10k+",
  },
  "Pending Approvals": {
    status: "Pending",
  },
  "Marketing Only": {
    category: "Marketing",
  },
  "This Quarter": {
    dateRange: "This Quarter",
  },
  "High Value ($10k+)": {
    amountRange: "$10k+",
  },
};

export default function ExpensesPage() {
  const [filters, setFilters] =
    useState(defaultFilters);

  const [activeSavedFilter, setActiveSavedFilter] =
    useState("");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const amount =
        expense.incurred ?? expense.planned;

      const matchesStatus =
        filters.status === "All Expenses" ||
        expense.status === filters.status;

      const matchesCategory =
        filters.category ===
          "All Categories" ||
        expense.category === filters.category;

      const matchesAmount =
        filters.amountRange ===
          "All Amounts" ||
        (filters.amountRange ===
          "Under $5k" &&
          amount < 5000) ||
        (filters.amountRange ===
          "$5k - $10k" &&
          amount >= 5000 &&
          amount < 10000) ||
        (filters.amountRange === "$10k+" &&
          amount >= 10000);

      return (
        matchesStatus &&
        matchesCategory &&
        matchesAmount
      );
    });
  }, [filters]);

  function selectSavedFilter(filter: string) {
    setActiveSavedFilter(filter);

    setFilters({
      ...defaultFilters,
      ...savedFilterMap[filter],
    });
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] space-y-4">
        <ExpensesHeader />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-4">
            <ExpensesFilters
              filters={filters}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
                setActiveSavedFilter("");
              }}
            />

            <ExpensesSummary
              expenses={expenses}
            />

            <ExpensesTable
              expenses={filteredExpenses}
            />
          </div>

          <SavedFilters
            activeFilter={activeSavedFilter}
            onSelect={selectSavedFilter}
          />
        </div>
      </div>
    </DashboardShell>
  );
}