"use client";

import { ActivityLog } from "./ActivityLog";
import { Breadcrumbs } from "./Breadcrumbs";
import { RelatedSection } from "./RelatedSection";
import { ReviewersSection } from "./ReviewersSection";
import { StageAssignment } from "./StageAssignment";
import { TaskHeader } from "./TaskHeader";
import { TaskInfoCard } from "./TaskInfoCard";
import { useTaskDetails } from "./hooks/useTaskDetails";

export function TaskDetailsWorkspace() {
  const state = useTaskDetails();

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={state.breadcrumbs} />
      <TaskHeader
        task={state.task}
        onBack={state.handleBack}
        onSave={state.handleSave}
        onMore={state.handleMore}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <TaskInfoCard task={state.task} />
          <StageAssignment
            stage={state.stage}
            assignee={state.assignee}
            dueDate={state.dueDate}
            stageOptions={state.stageOptions}
            assigneeOptions={state.assigneeOptions}
            dueDateOptions={state.dueDateOptions}
            onStageChange={state.updateStage}
            onAssigneeChange={state.updateAssignee}
            onDueDateChange={state.updateDueDate}
          />
          <ReviewersSection reviewers={state.reviewers} />
        </div>

        <aside className="space-y-5">
          <ActivityLog activityLogs={state.activityLogs} />
          <RelatedSection relatedEntities={state.relatedEntities} />
        </aside>
      </div>
    </div>
  );
}
