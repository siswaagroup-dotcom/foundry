import { memo, useMemo } from "react";

import type { Expense } from "@/types/expense";

type ExpensesSummaryProps = {
  expenses: Expense[];
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

export const ExpensesSummary = memo(function ExpensesSummary({ expenses }: ExpensesSummaryProps) {
  const stats = useMemo(() => {
    const totalPlanned = expenses.reduce((sum, expense) => sum + expense.planned, 0);
    const totalIncurred = expenses.reduce(
      (sum, expense) => sum + (expense.incurred ?? 0),
      0,
    );
    const variance = totalPlanned - totalIncurred;
    const usage = totalPlanned ? Math.round((totalIncurred / totalPlanned) * 1000) / 10 : 0;

    return [
      { label: "Total Planned", value: formatCurrency(totalPlanned), tone: "text-sky-500" },
      { label: "Total Incurred", value: formatCurrency(totalIncurred), tone: "text-orange-600" },
      { label: "Variance", value: formatCurrency(variance), tone: "text-emerald-500" },
      { label: "Budget Usage", value: `${usage}%`, tone: "text-slate-950" },
    ];
  }, [expenses]);

  return (
    <section className="rounded-xl border border-indigo-100/70 bg-indigo-50/80 p-5 shadow-[0_12px_28px_rgba(79,70,229,0.06)]">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-slate-500">
              {stat.label}
            </p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${stat.tone}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
});
