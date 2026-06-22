"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useExpense } from "@/hooks/useExpense";
import { useApproveExpense, useDeleteExpense } from "@/hooks/useExpenses";
import type { ApprovalStage } from "@/types/expense";
import type {
  BreadcrumbItem, WorkflowStep, ActivityLogItem, RelatedLink,
} from "../types/expense-detail-types";

export function useExpenseDetail() {
  const router   = useRouter();
  const { toast } = useToast();
  const params   = useParams<{ id: string }>();
  const expenseId = params?.id ?? "";

  const { data: expense, isLoading, isError } = useExpense(expenseId);
  const approveMutation = useApproveExpense();
  const deleteMutation  = useDeleteExpense();

  const [approvalComment, setApprovalComment] = useState("");

  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { id: "expenses", label: "Expenses" },
    { id: "detail",   label: expense?.name ?? "Expense Detail" },
  ];

  // Map approvals → WorkflowStep shape (existing UI component)
  const workflowSteps: WorkflowStep[] = (expense?.approvals ?? []).map((a) => ({
    id:        a.id,
    title:     stageLabel(a.stage),
    approver:  a.approverName,
    timestamp: new Date(a.actionedAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    status: a.stage === "approved" ? "Complete"
          : a.stage === "rejected" ? "Rejected"
          : "Pending",
  }));

  // Map approvals → ActivityLogItem shape (existing UI component)
  const activityLog: ActivityLogItem[] = (expense?.approvals ?? []).map((a) => ({
    id:        a.id,
    action:    `${a.approverName} — ${stageLabel(a.stage)}${a.comment ? `: "${a.comment}"` : ""}`,
    timestamp: new Date(a.actionedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    type:      a.stage === "approved" ? "approved"
             : a.stage === "rejected" ? "rejected"
             : "note",
  }));

  const relatedLinks: RelatedLink[] = [
    { id: "back", title: "Back to Expenses", href: "/dashboard/expenses" },
  ];

  // Map expense to the shape ExpenseDetail / ExpenseSummary components expect
  const expenseDetail = expense ? {
    id:            expense.id,
    title:         expense.name,
    amount:        expense.amountPlanned,
    currency:      expense.currency,
    vendor:        expense.vendor ?? "—",
    date:          new Date(expense.expenseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    category:      expense.category,
    paymentMethod: "—",
    relatedClient: "—",
    status:        capitalise(expense.status),
  } : null;

  // ── Actions ──────────────────────────────────────────────────────────────────

  const submitApproval = useCallback(async (stage: ApprovalStage) => {
    if (!expenseId) return;
    approveMutation.mutate(
      { id: expenseId, input: { stage, comment: approvalComment || undefined } },
      {
        onSuccess: () => {
          toast({ title: stageToast(stage), variant: stage === "rejected" ? "error" : "success" });
          setApprovalComment("");
        },
        onError: (err) => toast({ title: "Action failed", description: err.message, variant: "error" }),
      }
    );
  }, [expenseId, approvalComment, approveMutation, toast]);

  const editExpense = useCallback(() => {
    router.push(`/dashboard/expenses/${expenseId}/edit`);
  }, [expenseId, router]);

  const handleDelete = useCallback(() => {
    if (!expenseId) return;
    deleteMutation.mutate(expenseId, {
      onSuccess: () => { toast({ title: "Expense deleted", variant: "success" }); router.push("/dashboard/expenses"); },
      onError:   (err) => toast({ title: "Failed to delete", description: err.message, variant: "error" }),
    });
  }, [expenseId, deleteMutation, toast, router]);

  const moreActions = handleDelete;

  const openRelatedLink = useCallback((linkId: string) => {
    const link = relatedLinks.find((l) => l.id === linkId);
    if (link) router.push(link.href);
  }, [relatedLinks, router]);

  return {
    expenseId,
    breadcrumbs,
    expense: expenseDetail,
    rawExpense: expense,
    workflowSteps,
    activityLog,
    relatedLinks,
    approvalComment,
    setApprovalComment,
    isLoading,
    isError,
    isApproving: approveMutation.isPending,
    isDeleting:  deleteMutation.isPending,
    submitApproval,
    editExpense,
    moreActions,
    openRelatedLink,
  };
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    submitted:          "Submitted",
    under_review:       "Under Review",
    approved:           "Approved",
    rejected:           "Rejected",
    changes_requested:  "Changes Requested",
  };
  return map[stage] ?? stage;
}

function stageToast(stage: ApprovalStage): string {
  const map: Record<ApprovalStage, string> = {
    submitted:          "Submitted for approval",
    under_review:       "Marked as under review",
    approved:           "Expense approved",
    rejected:           "Expense rejected",
    changes_requested:  "Changes requested",
  };
  return map[stage];
}
