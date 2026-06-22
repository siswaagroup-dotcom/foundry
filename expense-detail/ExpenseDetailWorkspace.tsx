"use client";

import { ActivityLog } from "./ActivityLog";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { Breadcrumbs } from "./Breadcrumbs";
import { ExpenseHeader } from "./ExpenseHeader";
import { ExpenseSummary } from "./ExpenseSummary";
import { RelatedLinks } from "./RelatedLinks";
import { ApprovalActions } from "./ApprovalActions";
import { useExpenseDetail } from "./hooks/useExpenseDetail";

export function ExpenseDetailWorkspace() {
  const state = useExpenseDetail();

  if (state.isLoading || !state.expense) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (state.isError) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <p className="text-sm text-red-600">Expense not found or failed to load.</p>
          <button onClick={() => state.openRelatedLink("back")} className="text-sm font-medium text-primary underline">
            Back to Expenses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Breadcrumbs items={state.breadcrumbs} />
      <ExpenseHeader
        expense={state.expense}
        onEdit={state.editExpense}
        onMore={state.moreActions}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ExpenseSummary expense={state.expense} />
          <ApprovalWorkflow workflowSteps={state.workflowSteps} />
          <ApprovalActions
            comment={state.approvalComment}
            onCommentChange={state.setApprovalComment}
            onSubmit={state.submitApproval}
            isLoading={state.isApproving}
          />
        </div>

        <aside className="space-y-5">
          <ActivityLog activityLog={state.activityLog} />
          <RelatedLinks relatedLinks={state.relatedLinks} onLinkClick={state.openRelatedLink} />
        </aside>
      </div>
    </div>
  );
}
