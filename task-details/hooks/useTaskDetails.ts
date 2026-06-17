"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useTask } from "@/hooks/useTask";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useTaskComments, useAddComment, useDeleteComment } from "@/hooks/useTaskComments";
import type { BreadcrumbItem, SelectOption } from "../types/task-details-types";

const STAGE_OPTIONS: SelectOption[] = [
  { label: "To Do",    value: "todo"     },
  { label: "Planning", value: "planning" },
  { label: "Doing",    value: "doing"    },
  { label: "Review",   value: "review"   },
  { label: "Done",     value: "done"     },
];

export function useTaskDetails() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const taskId = params?.id ?? "";

  // ── Data queries ────────────────────────────────────────────────────────────
  const { data: task, isLoading, isError } = useTask(taskId);
  const { data: comments = [] } = useTaskComments(taskId);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const addCommentMutation = useAddComment(taskId);
  const deleteCommentMutation = useDeleteComment(taskId);

  // ── Local comment draft ──────────────────────────────────────────────────────
  const [commentDraft, setCommentDraft] = useState("");

  // ── Breadcrumbs ─────────────────────────────────────────────────────────────
  const breadcrumbs: BreadcrumbItem[] = [
    { id: "tasks", label: "Tasks" },
    { id: "current", label: task?.title ?? "Loading…" },
  ];

  // ── Field update helpers ─────────────────────────────────────────────────────
  const updateStage = useCallback(
    (value: string) => {
      if (!taskId) return;
      updateMutation.mutate(
        { id: taskId, input: { status: value as import("@/services/task.service").TaskStatus } },
        {
          onError: () => toast({ title: "Failed to update stage", variant: "error" }),
        }
      );
    },
    [taskId, updateMutation, toast]
  );

  const updatePriority = useCallback(
    (value: string) => {
      if (!taskId) return;
      updateMutation.mutate(
        { id: taskId, input: { priority: value as import("@/services/task.service").TaskPriority } },
        {
          onError: () => toast({ title: "Failed to update priority", variant: "error" }),
        }
      );
    },
    [taskId, updateMutation, toast]
  );

  const updateDueDate = useCallback(
    (value: string) => {
      if (!taskId) return;
      updateMutation.mutate(
        { id: taskId, input: { dueDate: value || null } },
        {
          onError: () => toast({ title: "Failed to update due date", variant: "error" }),
        }
      );
    },
    [taskId, updateMutation, toast]
  );

  const handleSave = useCallback(() => {
    toast({ title: "Changes saved", variant: "success" });
  }, [toast]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/tasks");
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!taskId) return;
    deleteMutation.mutate(taskId, {
      onSuccess: () => {
        toast({ title: "Task deleted", variant: "success" });
        router.push("/dashboard/tasks");
      },
      onError: () => toast({ title: "Failed to delete task", variant: "error" }),
    });
  }, [taskId, deleteMutation, toast, router]);

  // ── Comment helpers ──────────────────────────────────────────────────────────
  const submitComment = useCallback(async () => {
    const body = commentDraft.trim();
    if (!body) return;
    addCommentMutation.mutate(body, {
      onSuccess: () => setCommentDraft(""),
      onError: () => toast({ title: "Failed to add comment", variant: "error" }),
    });
  }, [commentDraft, addCommentMutation, toast]);

  const removeComment = useCallback(
    (commentId: string) => {
      deleteCommentMutation.mutate(commentId, {
        onError: () => toast({ title: "Failed to delete comment", variant: "error" }),
      });
    },
    [deleteCommentMutation, toast]
  );

  // ── Map task → legacy TaskDetails shape expected by components ───────────────
  const taskDetails = task
    ? {
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        createdAt: new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        updatedAt: new Date(task.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        urgency: task.priority,
        stage: task.status,
        assignedTo: task.assignees[0]?.name ?? "Unassigned",
        dueDate: task.dueDate ?? "",
      }
    : null;

  // ── Map comments → ActivityLogItem shape ────────────────────────────────────
  const activityLogs = comments.map((c) => ({
    id: c.id,
    user: c.authorName,
    action: "added a comment",
    timestamp: new Date(c.createdAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    }),
    type: "comment" as const,
    body: c.body,
    authorId: c.authorId,
  }));

  return {
    task: taskDetails,
    isLoading,
    isError,
    breadcrumbs,
    stage: task?.status ?? "",
    assignee: task?.assignees[0]?.name ?? "",
    dueDate: task?.dueDate ?? "",
    stageOptions: STAGE_OPTIONS,
    assigneeOptions: task?.assignees.map((a) => ({ label: a.name, value: a.name })) ?? [],
    dueDateOptions: [],
    reviewers: task?.assignees.map((a) => ({
      id: a.userId, name: a.name, role: "", avatar: a.initials, status: "Assigned",
    })) ?? [],
    activityLogs,
    relatedEntities: [] as { id: string; title: string; subtitle: string }[],
    // Comment controls
    commentDraft,
    setCommentDraft,
    submitComment,
    removeComment,
    isSubmittingComment: addCommentMutation.isPending,
    // Actions
    updateStage,
    updatePriority,
    updateAssignee: updateStage, // placeholder — full assignee change needs member list
    updateDueDate,
    handleBack,
    handleSave,
    handleDelete,
    handleMore: handleDelete,
  };
}
