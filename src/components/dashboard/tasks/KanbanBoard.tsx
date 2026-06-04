"use client";

import { memo, useCallback, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Task, TaskStatus } from "../../../../types/task-types";
 
import { KanbanColumn } from "./KanbanColumn";

const validStatuses: TaskStatus[] = ["todo", "planning", "doing", "review"];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (
    taskId: string,
    newStatus: TaskStatus
  ) => void;
  onTaskOpen: (taskId: string) => void;
}

export const KanbanBoard = memo(function KanbanBoard({
  tasks,
  onTaskMove,
  onTaskOpen,
}: KanbanBoardProps) {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  });
  const sensors = useSensors(pointerSensor);

  const columns = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "todo"),
      planning: tasks.filter((task) => task.status === "planning"),
      doing: tasks.filter((task) => task.status === "doing"),
      review: tasks.filter((task) => task.status === "review"),
    }),
    [tasks],
  );

  const taskById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeTask = taskById.get(String(active.id));

      if (!activeTask) return;

      const overTask = taskById.get(String(over.id));

      if (overTask) {
        onTaskMove(activeTask.id, overTask.status);
        return;
      }

      if (validStatuses.includes(over.id as TaskStatus)) {
        onTaskMove(activeTask.id, over.id as TaskStatus);
      }
    },
    [onTaskMove, taskById],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-5">
          <KanbanColumn
            id="todo"
            title="To Do"
            tasks={columns.todo}
            onTaskOpen={onTaskOpen}
          />

          <KanbanColumn
            id="planning"
            title="Planning"
            tasks={columns.planning}
            onTaskOpen={onTaskOpen}
          />

          <KanbanColumn
            id="doing"
            title="Doing"
            tasks={columns.doing}
            onTaskOpen={onTaskOpen}
          />

          <KanbanColumn
            id="review"
            title="Review"
            tasks={columns.review}
            onTaskOpen={onTaskOpen}
          />
        </div>
      </div>
    </DndContext>
  );
});
