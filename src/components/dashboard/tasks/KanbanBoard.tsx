"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Task, TaskStatus } from "@/types/task-types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (
    taskId: string,
    newStatus: TaskStatus
  ) => void;
}

export function KanbanBoard({
  tasks,
  onTaskMove,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const todo = tasks.filter(
    (task) => task.status === "todo"
  );

  const planning = tasks.filter(
    (task) => task.status === "planning"
  );

  const doing = tasks.filter(
    (task) => task.status === "doing"
  );

  const review = tasks.filter(
    (task) => task.status === "review"
  );
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  if (!over) return;

  const activeTask = tasks.find(
    (task) => task.id === active.id
  );

  if (!activeTask) return;

  // Dropped on another task card
  const overTask = tasks.find(
    (task) => task.id === over.id
  );

  if (overTask) {
    onTaskMove(
      activeTask.id,
      overTask.status
    );
    return;
  }

  // Dropped on a column
  const validStatuses: TaskStatus[] = [
    "todo",
    "planning",
    "doing",
    "review",
  ];

  if (
    validStatuses.includes(
      over.id as TaskStatus
    )
  ) {
    onTaskMove(
      activeTask.id,
      over.id as TaskStatus
    );
  }
}

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
            tasks={todo}
          />

          <KanbanColumn
            id="planning"
            title="Planning"
            tasks={planning}
          />

          <KanbanColumn
            id="doing"
            title="Doing"
            tasks={doing}
          />

          <KanbanColumn
            id="review"
            title="Review"
            tasks={review}
          />
        </div>
      </div>
    </DndContext>
  );
}