"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useExpense } from "@/hooks/useExpense";
import { useAddExpenseAttachment, useApproveExpense, useDeleteExpense } from "@/hooks/useExpenses";
import type { ApprovalStage } from "@/types/expense";
import type {
  ActivityLogItem, BreadcrumbItem, RelatedLink, WorkflowStep,
} from "../types/expense-detail-types";

export function useExpenseDetail() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const expenseId = params?.id ?? "";

  const { data: expense, isLoading, isError } = useExpense(expenseId);
  const approveMutation = useApproveExpense();
  const attachmentMutation = useAddExpenseAttachment();
  const deleteMutation = useDeleteExpense();

  const [approvalComment, setApprovalComment] = useState("");
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const [attachmentFileUrl, setAttachmentFileUrl] = useState("");
  const [attachmentMimeType, setAttachmentMimeType] = useState("");

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "expenses", label: "Expenses", href: "/dashboard/expenses" },
    { id: "detail", label: expense?.name ?? "Expense Detail" },
  ];

  const workflowSteps: WorkflowStep[] = (expense?.approvals ?? []).map((approval) => ({
    id: approval.id,
    title: stageLabel(approval.stage),
    approver: approval.approverName,
    timestamp: new Date(approval.actionedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: approval.stage === "approved" || approval.stage === "paid"
      ? "Complete"
      : approval.stage === "rejected"
        ? "Rejected"
        : "Pending",
  }));

  const approvalActivity: ActivityLogItem[] = (expense?.approvals ?? []).map((approval) => ({
    id: approval.id,
    action: `${approval.approverName} - ${stageLabel(approval.stage)}${approval.comment ? `: "${approval.comment}"` : ""}`,
    timestamp: new Date(approval.actionedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    type: approval.stage === "approved" || approval.stage === "paid"
      ? "approved"
      : approval.stage === "rejected"
        ? "rejected"
        : "note",
  }));

  const attachmentActivity: ActivityLogItem[] = (expense?.attachments ?? []).map((attachment) => ({
    id: attachment.id,
    action: `${attachment.uploaderName} attached ${attachment.fileName}`,
    timestamp: new Date(attachment.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    type: "attachment",
  }));

  const activityLog = [...approvalActivity, ...attachmentActivity];
  const rejectionReason =
    [...(expense?.approvals ?? [])].reverse().find((approval) => approval.stage === "rejected" && approval.comment)?.comment
    ?? expense?.notes
    ?? null;

  const relatedLinks: RelatedLink[] = [
    { id: "back", title: "Back to Expenses", href: "/dashboard/expenses" },
  ];

  const expenseDetail = expense ? {
    id: expense.id,
    title: expense.name,
    amount: expense.amountPlanned,
    amountIncurred: expense.amountIncurred,
    currency: expense.currency,
    vendor: expense.vendor ?? "-",
    date: new Date(expense.expenseDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    category: expense.category,
    paymentMethod: "-",
    relatedClient: expense.clientId ?? "-",
    status: capitalise(expense.status),
    notes: expense.notes,
  } : null;

  const submitApproval = useCallback((stage: ApprovalStage) => {
    if (!expenseId) return;
    approveMutation.mutate(
      { id: expenseId, input: { stage, comment: approvalComment || undefined } },
      {
        onSuccess: () => {
          toast({ title: stageToast(stage), variant: stage === "rejected" ? "error" : "success" });
          setApprovalComment("");
        },
        onError: (err) => toast({ title: "Action failed", description: err.message, variant: "error" }),
      },
    );
  }, [approvalComment, approveMutation, expenseId, toast]);

  const addAttachment = useCallback(() => {
    if (!expenseId) return;
    attachmentMutation.mutate(
      {
        id: expenseId,
        input: {
          fileName: attachmentFileName,
          fileUrl: attachmentFileUrl,
          mimeType: attachmentMimeType.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Attachment added", variant: "success" });
          setAttachmentFileName("");
          setAttachmentFileUrl("");
          setAttachmentMimeType("");
        },
        onError: (err) => toast({ title: "Failed to add attachment", description: err.message, variant: "error" }),
      },
    );
  }, [attachmentFileName, attachmentFileUrl, attachmentMimeType, attachmentMutation, expenseId, toast]);

  const editExpense = useCallback(() => {
    router.push(`/dashboard/expenses/${expenseId}/edit`);
  }, [expenseId, router]);

  const handleDelete = useCallback(() => {
    if (!expenseId) return;
    deleteMutation.mutate(expenseId, {
      onSuccess: () => {
        toast({ title: "Expense deleted", variant: "success" });
        router.push("/dashboard/expenses");
      },
      onError: (err) => toast({ title: "Failed to delete", description: err.message, variant: "error" }),
    });
  }, [deleteMutation, expenseId, router, toast]);

  const moreActions = handleDelete;

  const openRelatedLink = useCallback((linkId: string) => {
    const link = relatedLinks.find((item) => item.id === linkId);
    if (link) router.push(link.href);
  }, [relatedLinks, router]);

  return {
    expenseId,
    breadcrumbs,
    expense: expenseDetail,
    rawExpense: expense,
    workflowSteps,
    activityLog,
    rejectionReason,
    relatedLinks,
    approvalComment,
    setApprovalComment,
    attachmentFileName,
    setAttachmentFileName,
    attachmentFileUrl,
    setAttachmentFileUrl,
    attachmentMimeType,
    setAttachmentMimeType,
    isLoading,
    isError,
    isApproving: approveMutation.isPending,
    isAddingAttachment: attachmentMutation.isPending,
    isDeleting: deleteMutation.isPending,
    submitApproval,
    addAttachment,
    editExpense,
    moreActions,
    openRelatedLink,
  };
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    changes_requested: "Changes Requested",
    paid: "Paid",
  };
  return map[stage] ?? stage;
}

function stageToast(stage: ApprovalStage): string {
  const map: Record<ApprovalStage, string> = {
    submitted: "Submitted for approval",
    under_review: "Marked as under review",
    approved: "Expense approved",
    rejected: "Expense rejected",
    changes_requested: "Changes requested",
    paid: "Expense marked as paid",
  };
  return map[stage];
}
