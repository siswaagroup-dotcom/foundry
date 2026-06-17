"use client";

import { ActivityLog } from "./ActivityLog";
import { Breadcrumbs } from "./Breadcrumbs";
import { RelatedSection } from "./RelatedSection";
import { ReviewersSection } from "./ReviewersSection";
import { StageAssignment } from "./StageAssignment";
import { TaskHeader } from "./TaskHeader";
import { TaskInfoCard } from "./TaskInfoCard";
import { CommentSection } from "./CommentSection";
import { useTaskDetails } from "./hooks/useTaskDetails";

export function TaskDetailsWorkspace() {
  const state = useTaskDetails();

  // ── Loading state ────────────────────────────────────────────────────────────
  if (state.isLoading || !state.task) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (state.isError) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <p className="text-sm text-red-600">Failed to load task. It may have been deleted.</p>
          <button
            onClick={state.handleBack}
            className="text-sm font-medium text-primary underline"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

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

          {/* Comments */}
          <CommentSection
            activityLogs={state.activityLogs}
            commentDraft={state.commentDraft}
            onDraftChange={state.setCommentDraft}
            onSubmit={state.submitComment}
            onDelete={state.removeComment}
            isSubmitting={state.isSubmittingComment}
          />
        </div>

        <aside className="space-y-5">
          <ActivityLog activityLogs={state.activityLogs} />
          <RelatedSection relatedEntities={state.relatedEntities} />
        </aside>
      </div>
    </div>
  );
}
