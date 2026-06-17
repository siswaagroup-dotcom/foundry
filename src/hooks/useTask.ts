"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTask } from "@/services/task.service";

export const taskDetailKey = (id: string) => ["tasks", "detail", id] as const;

export function useTask(id: string) {
  return useQuery({
    queryKey: taskDetailKey(id),
    queryFn: () => fetchTask(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
