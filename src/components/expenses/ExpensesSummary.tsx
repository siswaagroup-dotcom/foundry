import { memo, useMemo } from "react";
import type { Expense } from "@/types/expense";

type ExpensesSummaryProps = { expenses: Expense[] };

function fmt(v: number) { return `$${v.toLocaleString()}`; }

export const ExpensesSummary = memo(function ExpensesSummary({ expenses }: ExpensesSummaryProps) {
  const stats = useMemo(() => {
    const planned  = expenses.reduce((s, e) => s + e.amountPlanned, 0);
    const incurred = expenses.reduce((s, e) => s + (e.amountIncurred ?? 0), 0);
    const variance = planned - incurred;
    const usage    = planned ? Math.round((incurred / planned) * 1000) / 10 : 0;
    return [
      { label: "Total Planned",  value: fmt(planned),  tone: "text-sky-500"     },
      { label: "Total Incurred", value: fmt(incurred), tone: "text-orange-600"  },
      { label: "Variance",       value: fmt(variance), tone: "text-emerald-500" },
      { label: "Budget Usage",   value: `${usage}%`,   tone: "text-slate-950"  },
    ];
  }, [expenses]);

  return (
    <section className="rounded-xl border border-indigo-100/70 bg-indigo-50/80 p-5 shadow-[0_12px_28px_rgba(79,70,229,0.06)]">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-slate-500">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
