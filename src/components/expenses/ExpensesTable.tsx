import { memo } from "react";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import type { Expense } from "@/types/expense";

type ExpensesTableProps = {
  expenses: Expense[];
  onSelectExpense?: (expense: Expense) => void;
};

const headers = ["Expense Name", "Category", "Date", "Status", "Planned", "Incurred", "Variance"];

export const ExpensesTable = memo(function ExpensesTable({ expenses, onSelectExpense }: ExpensesTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
      <div className="hidden border-b border-slate-100 bg-slate-50/90 px-4 py-4 lg:grid lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.75fr_0.75fr_0.75fr_0.75fr]">
        {headers.map((h) => (
          <span key={h} className="text-[11px] font-bold uppercase tracking-[0.09em] text-slate-500">{h}</span>
        ))}
      </div>
      <div>
        {expenses.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">No expenses found.</p>
        ) : (
          expenses.map((e) => <ExpenseRow key={e.id} expense={e} onSelect={onSelectExpense} />)
        )}
      </div>
    </section>
  );
});
