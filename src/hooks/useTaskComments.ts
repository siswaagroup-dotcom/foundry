"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addComment,
  deleteComment,
  fetchComments,
  type TaskComment,
} from "@/services/task.service";

const commentsKey = (taskId: string) => ["tasks", taskId, "comments"] as const;

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: commentsKey(taskId),
    queryFn: () => fetchComments(taskId),
    enabled: Boolean(taskId),
    staleTime: 30_000,
  });
}

export function useAddComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addComment(taskId, body),
    onSuccess: (newComment) => {
      qc.setQueryData<TaskComment[]>(commentsKey(taskId), (old) =>
        old ? [...old, newComment] : [newComment]
      );
    },
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: commentsKey(taskId) });
      const previous = qc.getQueryData<TaskComment[]>(commentsKey(taskId));
      qc.setQueryData<TaskComment[]>(commentsKey(taskId), (old) =>
        old?.filter((c) => c.id !== commentId) ?? old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(commentsKey(taskId), ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentsKey(taskId) });
    },
  });
}
