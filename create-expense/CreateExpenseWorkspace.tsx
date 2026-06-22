"use client";

import { CreditCard, Home, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateExpense } from "./hooks/useCreateExpense";
import type { ExpenseStatus } from "./types/expense-types";

export function CreateExpenseWorkspace() {
  const expense = useCreateExpense();
  const fieldClass =
    "h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none";
  const detailFields = [
    { key: "date", label: "Date", node: (
      <input value={expense.formData.date} onChange={(event) => expense.updateField("date", event.target.value)} className={fieldClass} />
    ) },
    { key: "vendor", label: "Vendor", node: (
      <input value={expense.formData.vendor} onChange={(event) => expense.updateField("vendor", event.target.value)} placeholder="Enter vendor name" className={fieldClass} />
    ) },
    { key: "category", label: "Category", node: (
      <select value={expense.formData.category} onChange={(event) => expense.updateField("category", event.target.value)} className={`${fieldClass} bg-white`}>
        {expense.categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
      </select>
    ) },
  ];

  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-[#e5e7eb] px-7 py-6">
        <nav className="mb-5 flex items-center gap-2 text-xs text-[#6b7280]">
          <Home className="h-3.5 w-3.5" />
          <span>Expenses</span>
          <span>/</span>
          <span className="font-semibold text-primary">Create Expense</span>
        </nav>
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <h1 className="text-[24px] font-bold leading-none text-[#111827]">Create Expense</h1>
        </div>
      </header>

      <main className="bg-[#f7f8ff] px-4 py-10">
        <div className="mx-auto max-w-[610px] rounded-xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <section className="p-8">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              Status <Info className="h-3.5 w-3.5 text-[#6b7280]" />
            </div>
            <div className="inline-flex rounded-lg bg-[#f3f4f6] p-1">
              {expense.statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => expense.selectStatus(option.value as ExpenseStatus)}
                  className={cn(
                    "h-9 rounded-md px-4 text-sm font-medium text-[#6b7280]",
                    expense.formData.status === option.value && "bg-white text-primary shadow-sm",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-[#6b7280]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {expense.statusOptions.map((option) => option.description).join(" ")}
            </p>
          </section>

          <section className="border-t border-[#e5e7eb] p-8">
            <div className="mb-6 flex items-center gap-2">
              <Zap className="h-4 w-4 fill-primary text-primary" />
              <h2 className="text-base font-bold">Amount & Details</h2>
            </div>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Amount <span className="text-primary">*</span>
                </span>
                <div className="grid grid-cols-[110px_minmax(0,1fr)]">
                  <select
                    value={expense.formData.currency}
                    onChange={(event) => expense.updateField("currency", event.target.value)}
                    className="h-10 rounded-l-[10px] border border-[#e5e7eb] bg-white px-3 text-sm outline-none"
                  >
                    {expense.currencies.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={expense.formData.amount}
                    onChange={(event) => expense.updateField("amount", event.target.value)}
                    inputMode="decimal"
                    className="h-10 rounded-r-[10px] border border-l-0 border-[#e5e7eb] px-3 text-sm outline-none"
                  />
                </div>
              </label>

              {detailFields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-sm font-medium">
                    {field.label} <span className="text-primary">*</span>
                  </span>
                  {field.node}
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#e5e7eb] p-6">
            <Button variant="outline" onClick={expense.cancel} disabled={expense.isLoading}>Cancel</Button>
            <Button variant="outline" onClick={expense.saveDraft} disabled={expense.isLoading}>
              {expense.isLoading ? "Saving…" : "Save Draft"}
            </Button>
            <Button onClick={expense.createExpense} disabled={expense.isLoading}>
              {expense.isLoading ? "Creating…" : "Create Expense"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
