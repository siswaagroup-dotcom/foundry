"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Task } from "@/types/task-types";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export function KanbanColumn({
  id,
  title,
  tasks,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-w-[320px] rounded-xl border transition-colors
        ${
          isOver
            ? "border-orange-400 bg-orange-50"
            : "border-slate-200 bg-slate-50"
        }
      `}
    >
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
            {tasks.length}
          </span>
        </div>

        <button className="text-slate-400 hover:text-slate-600">
          ⋮
        </button>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[450px] space-y-4 p-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}