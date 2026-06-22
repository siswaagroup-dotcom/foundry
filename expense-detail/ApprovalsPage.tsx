"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useApproveExpense, usePendingApprovals } from "@/hooks/useExpenses";
import { useToast } from "@/components/ui/toast";
import type { Expense } from "@/types/expense";

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ApprovalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: pending = [], isLoading } = usePendingApprovals();
  const approveMutation = useApproveExpense();
  const [comments, setComments] = useState<Record<string, string>>({});

  function commentFor(expenseId: string) {
    return comments[expenseId]?.trim() || undefined;
  }

  function quickApprove(expense: Expense) {
    approveMutation.mutate(
      { id: expense.id, input: { stage: "approved", comment: commentFor(expense.id) } },
      {
        onSuccess: () => toast({ title: `${expense.name} approved`, variant: "success" }),
        onError: (err) => toast({ title: "Failed", description: err.message, variant: "error" }),
      },
    );
  }

  function quickReject(expense: Expense) {
    approveMutation.mutate(
      { id: expense.id, input: { stage: "rejected", comment: commentFor(expense.id) } },
      {
        onSuccess: () => toast({ title: `${expense.name} rejected`, variant: "error" }),
        onError: (err) => toast({ title: "Failed", description: err.message, variant: "error" }),
      },
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Pending Approvals</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Review and action expenses awaiting your approval.
        </p>
      </div>

      <DashboardCard title={`Pending (${pending.length})`}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-[#f3f4f6]" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
            <p className="text-sm font-semibold text-[#6b7280]">No pending approvals. All caught up.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#edf0f3]">
            {pending.map((expense) => (
              <div key={expense.id} className="grid gap-3 py-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)_auto] xl:items-center">
                <div className="flex min-w-0 gap-3">
                  <Clock className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <div className="min-w-0 cursor-pointer" onClick={() => router.push(`/dashboard/expenses/${expense.id}`)}>
                    <p className="truncate text-sm font-semibold">{expense.name}</p>
                    <p className="text-xs text-[#6b7280]">
                      {expense.category} / {expense.ownerName} /{" "}
                      {new Date(expense.expenseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <input
                  value={comments[expense.id] ?? ""}
                  onChange={(event) => setComments((current) => ({ ...current, [expense.id]: event.target.value }))}
                  placeholder="Approval comment or rejection reason"
                  className="h-9 min-w-0 rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-primary"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(expense.amountPlanned, expense.currency)}
                  </p>
                  <StatusBadge tone="orange">Pending</StatusBadge>
                  <button
                    type="button"
                    disabled={approveMutation.isPending}
                    onClick={() => quickApprove(expense)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={approveMutation.isPending}
                    onClick={() => quickReject(expense)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
