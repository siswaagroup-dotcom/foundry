"use client";

import { memo, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/services/task.service";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskOpen: (taskId: string) => void;
}

export const KanbanColumn = memo(function KanbanColumn({
  id,
  title,
  tasks,
  onTaskOpen,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[320px] rounded-xl border transition-colors ${
        isOver ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
            {tasks.length}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600">⋮</button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="min-h-[450px] space-y-4 p-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onTaskOpen} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
});
