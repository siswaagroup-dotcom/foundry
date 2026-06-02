"use client";

import { useState } from "react";

import { tasks as initialTasks } from "@/data/task-data";
 
import { KanbanBoard } from "./KanbanBoard";
import { TasksFilters } from "./TasksFilters";
import { TasksHeader } from "./TasksHeader";
import { TaskStatus } from "../../../../types/task-types";

export function TaskWorkspace() {
  const [tasks, setTasks] = useState(initialTasks);

  function handleTaskMove(
    taskId: string,
    newStatus: TaskStatus
  ) {
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
  }

  return (
    <div className="space-y-6">
      <TasksHeader />

      <TasksFilters />

      <KanbanBoard
        tasks={tasks}
        onTaskMove={handleTaskMove}
      />
    </div>
  );
}