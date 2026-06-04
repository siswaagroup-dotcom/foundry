"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { activityLog as activityLogData } from "../data/activity-log";
import { workflowSteps as workflowStepsData } from "../data/approval-workflow";
import { breadcrumbs, expenseDetail } from "../data/expense-detail";
import { relatedLinks as relatedLinksData } from "../data/related-links";

export function useExpenseDetail() {
  const router = useRouter();
  const [expense] = useState(expenseDetail);
  const [workflowSteps] = useState(workflowStepsData);
  const [activityLog] = useState(activityLogData);
  const [relatedLinks] = useState(relatedLinksData);

  const editExpense = useCallback(() => {
    router.push("/dashboard/expenses/create");
  }, [router]);

  const moreActions = useCallback(() => {
    console.log("More Actions");
  }, []);

  const openRelatedLink = useCallback((linkId: string) => {
    const link = relatedLinks.find((item) => item.id === linkId);
    router.push(link?.href ?? "/dashboard/expenses");
  }, [relatedLinks, router]);

  return {
    breadcrumbs,
    expense,
    workflowSteps,
    activityLog,
    relatedLinks,
    editExpense,
    moreActions,
    openRelatedLink,
  };
}
