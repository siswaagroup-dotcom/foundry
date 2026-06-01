"use client";

import { Calendar } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Task } from "@/types/task-types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        rounded-xl border bg-white p-4 shadow-sm
        transition-all duration-200
        hover:shadow-md
        cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-50 rotate-1 shadow-lg" : ""}
      `}
    >
      {/* Priority Indicator */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-orange-500" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900">
        {task.title}
      </h3>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-xs text-slate-500">
        {task.description}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
          {task.assignee}
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>{task.dueDate}</span>
        </div>
      </div>
    </div>
  );
}