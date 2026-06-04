import { DollarSign } from "lucide-react";
import type { ExpenseDetail } from "./types/expense-detail-types";

type ExpenseSummaryProps = {
  expense: ExpenseDetail;
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ExpenseSummary({ expense }: ExpenseSummaryProps) {
  const fields = [
    ["Amount", `$${formatAmount(expense.amount)}`],
    ["Currency", expense.currency],
    ["Vendor", expense.vendor],
    ["Date", expense.date],
    ["Category", expense.category],
    ["Payment Method", expense.paymentMethod],
    ["Related Client", expense.relatedClient],
    ["Status", "Incurred & Approved"],
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#edf0f3] px-5 py-4">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Expense Summary</h3>
      </div>
      <div className="grid gap-x-12 gap-y-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
              {label}
            </p>
            <p
              className={
                label === "Amount"
                  ? "mt-2 text-2xl font-bold text-primary"
                  : "mt-2 text-sm font-bold"
              }
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
