"use client";

import { ActivityLog } from "./ActivityLog";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { Breadcrumbs } from "./Breadcrumbs";
import { ExpenseHeader } from "./ExpenseHeader";
import { ExpenseSummary } from "./ExpenseSummary";
import { RelatedLinks } from "./RelatedLinks";
import { useExpenseDetail } from "./hooks/useExpenseDetail";

export function ExpenseDetailWorkspace() {
  const {
    breadcrumbs,
    expense,
    workflowSteps,
    activityLog,
    relatedLinks,
    editExpense,
    moreActions,
    openRelatedLink,
  } = useExpenseDetail();

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Breadcrumbs items={breadcrumbs} />
      <ExpenseHeader
        expense={expense}
        onEdit={editExpense}
        onMore={moreActions}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ExpenseSummary expense={expense} />
          <ApprovalWorkflow workflowSteps={workflowSteps} />
        </div>

        <aside className="space-y-5">
          <ActivityLog activityLog={activityLog} />
          <RelatedLinks
            relatedLinks={relatedLinks}
            onLinkClick={openRelatedLink}
          />
        </aside>
      </div>
    </div>
  );
}
