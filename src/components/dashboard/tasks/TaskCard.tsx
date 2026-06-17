"use client";

import { memo, useCallback, useMemo } from "react";
import { Calendar } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/services/task.service";

const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-slate-400",
  medium: "bg-blue-500",
  high:   "bg-orange-500",
  urgent: "bg-red-500",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

interface TaskCardProps {
  task: Task;
  onOpen: (taskId: string) => void;
}

export const TaskCard = memo(function TaskCard({ task, onOpen }: TaskCardProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = useMemo(
    () => ({ transform: CSS.Transform.toString(transform), transition }),
    [transform, transition]
  );

  const openTask = useCallback(() => onOpen(task.id), [onOpen, task.id]);
  const dotClass = PRIORITY_COLORS[task.priority] ?? "bg-slate-400";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={openTask}
      className={`rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 rotate-1 shadow-lg" : ""
      }`}
    >
      {/* Priority indicator */}
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${dotClass}`} />
        <span className="text-[10px] font-medium capitalize text-slate-400">{task.priority}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>

      {/* Description */}
      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs text-slate-500">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
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
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        {/* Assignee avatars */}
        <div className="flex -space-x-1.5">
          {task.assignees.slice(0, 3).map((a) => (
            <div
              key={a.userId}
              title={a.name}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-[10px] font-semibold text-white"
            >
              {a.initials}
            </div>
          ))}
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
});
