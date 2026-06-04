"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { tasks as initialTasks } from "@/data/task-data";
 
import { KanbanBoard } from "./KanbanBoard";
import { TasksFilters } from "./TasksFilters";
import { TasksHeader } from "./TasksHeader";
import { TaskStatus } from "../../../../types/task-types";

export function TaskWorkspace() {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);

  const handleTaskMove = useCallback((
    taskId: string,
    newStatus: TaskStatus
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
            }
        : task
      )
    );
  }, []);

  const openCreateTask = useCallback(
    () => router.push("/dashboard/tasks/create"),
    [router],
  );

  const openTask = useCallback(
    (taskId: string) => router.push(`/dashboard/tasks/${taskId}`),
    [router],
  );

  return (
    <div className="space-y-6">
      <TasksHeader onCreateTask={openCreateTask} />

      <TasksFilters />

      <KanbanBoard
        tasks={tasks}
        onTaskMove={handleTaskMove}
        onTaskOpen={openTask}
      />
    </div>
  );
}
