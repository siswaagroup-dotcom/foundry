"use client";

import { memo, useCallback, useMemo } from "react";
import {
  DndContext, type DragEndEvent, PointerSensor,
  closestCorners, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CRM_STAGES, type Client, type CrmStage } from "@/types/client";

// ─── Client card (sortable) ───────────────────────────────────────────────────

const ClientCard = memo(function ClientCard({ client }: { client: Client }) {
  const router = useRouter();
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: client.id, data: { client } });

  const style = useMemo(
    () => ({ transform: CSS.Transform.toString(transform), transition }),
    [transform, transition]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={() => router.push(`/dashboard/clients/${client.id}`)}
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm cursor-grab active:cursor-grabbing",
        "transition-all duration-200 hover:shadow-md",
        isDragging && "opacity-50 rotate-1 shadow-lg"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ff6b2a] text-sm font-bold text-white">
          {client.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{client.name}</p>
          {client.industry && (
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{client.industry}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {client.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {client.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Financials row */}
      {(client.quotedAmount !== null || client.taskCount > 0) && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          {client.quotedAmount !== null && (
            <span className="font-semibold text-emerald-600">
              ${client.quotedAmount.toLocaleString()}
            </span>
          )}
          {client.taskCount > 0 && (
            <span>{client.taskCount} task{client.taskCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}
    </div>
  );
});

// ─── Pipeline column ──────────────────────────────────────────────────────────

const PipelineColumn = memo(function PipelineColumn({
  stage, label, clients,
}: { stage: CrmStage; label: string; clients: Client[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const clientIds = useMemo(() => clients.map((c) => c.id), [clients]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-[280px] rounded-xl border transition-colors",
        isOver ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-slate-50"
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
          {clients.length}
        </span>
      </div>

      <SortableContext items={clientIds} strategy={verticalListSortingStrategy}>
        <div className="min-h-[400px] space-y-3 p-3">
          {clients.map((c) => <ClientCard key={c.id} client={c} />)}
        </div>
      </SortableContext>
    </div>
  );
});

// ─── Board ────────────────────────────────────────────────────────────────────

interface ClientPipelineBoardProps {
  pipeline: Record<CrmStage, Client[]>;
  onClientMove: (clientId: string, newStage: CrmStage) => void;
}

export const ClientPipelineBoard = memo(function ClientPipelineBoard({
  pipeline,
  onClientMove,
}: ClientPipelineBoardProps) {
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 6 } });
  const sensors = useSensors(pointerSensor);

  // Flat map for drag lookup
  const clientById = useMemo(() => {
    const m = new Map<string, Client>();
    Object.values(pipeline).flat().forEach((c) => m.set(c.id, c));
    return m;
  }, [pipeline]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const dragged = clientById.get(String(active.id));
      if (!dragged) return;

      // Dropped on a card — use that card's stage
      const overClient = clientById.get(String(over.id));
      const newStage   = overClient
        ? overClient.crmStatus
        : CRM_STAGES.some((s) => s.id === over.id)
          ? (over.id as CrmStage)
          : null;

      if (newStage && newStage !== dragged.crmStatus) {
        onClientMove(dragged.id, newStage);
      }
    },
    [clientById, onClientMove]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {CRM_STAGES.map((s) => (
            <PipelineColumn
              key={s.id}
              stage={s.id}
              label={s.label}
              clients={pipeline[s.id] ?? []}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
});
