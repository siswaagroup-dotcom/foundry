"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type CreateTaskInput,
  type Task,
  type TaskFilters,
  type UpdateTaskInput,
} from "@/services/task.service";

export const TASKS_KEY = ["tasks"] as const;

export function taskKeys(filters: TaskFilters = {}) {
  return [...TASKS_KEY, filters] as const;
}

// ─── useTaskList ─────────────────────────────────────────────────────────────
// Fetches all tasks for the workspace with optional filters.
export function useTaskList(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys(filters),
    queryFn: () => fetchTasks(filters),
    staleTime: 30_000,
  });
}

// ─── useCreateTask ───────────────────────────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

// ─── useUpdateTask ───────────────────────────────────────────────────────────
// Optimistic update: immediately reflects status change in UI,
// persists to DB, rolls back on failure.
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel in-flight refetches
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      // Snapshot previous state for rollback
      const previous = qc.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
      // Optimistically update every cached task list
      qc.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...input } : t)) ?? old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback on failure
      context?.previous?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

// ─── useDeleteTask ───────────────────────────────────────────────────────────
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
      qc.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (old) =>
        old?.filter((t) => t.id !== id) ?? old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
