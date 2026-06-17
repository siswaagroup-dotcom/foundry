"use client";

import { memo, useCallback, useMemo } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/services/task.service";
import { KanbanColumn } from "./KanbanColumn";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo",     title: "To Do"    },
  { id: "planning", title: "Planning" },
  { id: "doing",    title: "Doing"    },
  { id: "review",   title: "Review"   },
  { id: "done",     title: "Done"     },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
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

  const columns = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [], planning: [], doing: [], review: [], done: [],
    };
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasks]);

  const taskById = useMemo(
    () => new Map(tasks.map((t) => [t.id, t])),
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeTask = taskById.get(String(active.id));
      if (!activeTask) return;

      const overTask = taskById.get(String(over.id));
      if (overTask) {
        if (overTask.status !== activeTask.status) {
          onTaskMove(activeTask.id, overTask.status);
        }
        return;
      }

      const overId = over.id as TaskStatus;
      if (COLUMNS.some((c) => c.id === overId) && overId !== activeTask.status) {
        onTaskMove(activeTask.id, overId);
      }
    },
    [onTaskMove, taskById]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-5">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={columns[col.id]}
              onTaskOpen={onTaskOpen}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
});
