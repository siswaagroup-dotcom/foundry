"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskList, useUpdateTask } from "@/hooks/useTasks";
import { useToast } from "@/components/ui/toast";
import type { TaskStatus } from "@/services/task.service";
import type { TaskFilters } from "@/services/task.service";
import { KanbanBoard } from "./KanbanBoard";
import { TasksFilters } from "./TasksFilters";
import { TasksHeader } from "./TasksHeader";

export function TaskWorkspace() {
  const router = useRouter();
  const { toast } = useToast();
  const [filters, setFilters] = useState<TaskFilters>({});

  const { data: tasks = [], isLoading } = useTaskList(filters);
  const updateTask = useUpdateTask();

  const handleTaskMove = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      updateTask.mutate(
        { id: taskId, input: { status: newStatus } },
        {
          onError: () =>
            toast({ title: "Failed to move task", variant: "error" }),
        }
      );
    },
    [updateTask, toast]
  );

  const openCreateTask = useCallback(
    () => router.push("/dashboard/tasks/create"),
    [router]
  );

  const openTask = useCallback(
    (taskId: string) => router.push(`/dashboard/tasks/${taskId}`),
    [router]
  );

  return (
    <div className="space-y-6">
      <TasksHeader onCreateTask={openCreateTask} />

      <TasksFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskOpen={openTask}
        />
      )}
    </div>
  );
}
