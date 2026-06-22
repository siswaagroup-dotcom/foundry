import { memo } from "react";
import type { ReactNode } from "react";
import type { Expense, ExpenseStatus } from "@/types/expense";
import { cn } from "@/lib/utils";

type ExpenseRowProps = {
  expense: Expense;
  onSelect?: (expense: Expense) => void;
};

const statusStyles: Record<ExpenseStatus, string> = {
  incurred: "bg-red-50 text-red-600 ring-red-100",
  planned:  "bg-blue-50 text-blue-600 ring-blue-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  pending:  "bg-amber-50 text-amber-700 ring-amber-100",
  rejected: "bg-gray-100 text-gray-600 ring-gray-200",
  paid:     "bg-violet-50 text-violet-700 ring-violet-100",
};

function formatCurrency(value: number | null) {
  return value === null ? "-" : `$${value.toLocaleString()}`;
}

function formatVariance(expense: Expense) {
  if (expense.amountIncurred === null) return "-";
  const variance = expense.amountPlanned - expense.amountIncurred;
  const prefix = variance > 0 ? "+" : variance < 0 ? "-" : "";
  return `${prefix}$${Math.abs(variance).toLocaleString()}`;
}

export const ExpenseRow = memo(function ExpenseRow({ expense, onSelect }: ExpenseRowProps) {
  const variance = expense.amountIncurred === null ? null : expense.amountPlanned - expense.amountIncurred;
  const dateStr  = new Date(expense.expenseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(expense)}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect?.(expense); }}
      className="grid cursor-pointer gap-3 border-b border-slate-100 bg-white px-4 py-4 transition hover:bg-slate-50/80 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.75fr_0.75fr_0.75fr_0.75fr] lg:items-center"
    >
      <div className="min-w-0">
        <p className="text-sm font-bold leading-5 text-slate-950">{expense.name}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">{expense.detail ?? expense.vendor ?? "—"}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm lg:contents">
        <MobileField label="Category" value={expense.category} />
        <MobileField label="Date"     value={dateStr} />
        <div>
          <MobileLabel>Status</MobileLabel>
          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1", statusStyles[expense.status])}>
            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
          </span>
        </div>
        <MobileField label="Planned"  value={formatCurrency(expense.amountPlanned)}  strong />
        <MobileField label="Incurred" value={formatCurrency(expense.amountIncurred)} strong />
        <div>
          <MobileLabel>Variance</MobileLabel>
          <span className={cn("text-sm font-bold",
            variance === null ? "text-slate-500" : variance >= 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {formatVariance(expense)}
          </span>
        </div>
      </div>
    </div>
  );
});

function MobileLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 lg:hidden">{children}</p>;
}

function MobileField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <MobileLabel>{label}</MobileLabel>
      <p className={cn("text-sm text-slate-700", strong && "font-bold text-slate-950")}>{value}</p>
    </div>
  );
}
