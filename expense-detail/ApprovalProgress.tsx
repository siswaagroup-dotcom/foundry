import { CheckCircle, Circle, Clock, CreditCard, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExpenseStatus } from "@/types/expense";

type ApprovalProgressProps = {
  status: ExpenseStatus;
};

const steps = [
  { id: "planned", label: "Draft", icon: Circle },
  { id: "pending", label: "Pending Approval", icon: Clock },
  { id: "approved", label: "Approved", icon: CheckCircle },
  { id: "paid", label: "Paid", icon: CreditCard },
] as const;

const order: Record<ExpenseStatus, number> = {
  planned: 0,
  pending: 1,
  incurred: 1,
  approved: 2,
  paid: 3,
  rejected: 1,
};

export function ApprovalProgress({ status }: ApprovalProgressProps) {
  const rejected = status === "rejected";
  const activeIndex = order[status];

  return (
    <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <h3 className="text-base font-bold">Approval Progress</h3>
      </div>
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          {steps.map((step, index) => {
            const complete = !rejected && index <= activeIndex;
            const active = !rejected && index === activeIndex;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                    complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#e5e7eb] bg-[#f8fafc] text-[#9ca3af]",
                    active && "ring-2 ring-emerald-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={cn("truncate text-sm font-bold", complete ? "text-[#111827]" : "text-[#6b7280]")}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {rejected && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <XCircle className="h-4 w-4" />
            Rejected
          </div>
        )}
      </div>
    </section>
  );
}
