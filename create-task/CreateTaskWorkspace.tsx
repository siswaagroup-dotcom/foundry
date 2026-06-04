"use client";

import { AlertCircle, AlertTriangle, Check, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateTask } from "./hooks/useCreateTask";
import type { UrgencyLevel } from "./types/task-types";

const icons = {
  check: Check,
  alert: AlertCircle,
  triangle: AlertTriangle,
  warning: AlertTriangle,
};

export function CreateTaskWorkspace() {
  const task = useCreateTask();

  return (
    <div className="min-h-full bg-white">
      <header className="px-7 py-6">
        <nav className="mb-5 flex items-center gap-2 text-xs text-[#6b7280]">
          <span>Tasks</span>
          <span>&gt;</span>
          <span className="font-semibold text-[#111827]">Create Task</span>
        </nav>
        <h1 className="text-[24px] font-bold leading-none text-[#1f2933]">Create New Task</h1>
      </header>

      <main className="bg-[#f7f8ff] px-4 py-7">
        <div className="mx-auto max-w-[690px] rounded-xl bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Task Title <span className="text-primary">*</span>
              </span>
              <input
                value={task.formData.title}
                onChange={(event) => task.updateField("title", event.target.value)}
                placeholder={task.config.titlePlaceholder}
                className="h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Description</span>
              <textarea
                value={task.formData.description}
                onChange={(event) => task.updateField("description", event.target.value)}
                placeholder={task.config.descriptionPlaceholder}
                className="min-h-[118px] w-full resize-y rounded-[10px] border border-[#e5e7eb] px-3 py-3 text-sm outline-none"
              />
              <span className="mt-2 block text-xs text-[#6b7280]">{task.config.descriptionHelper}</span>
            </label>

            <div>
              <span className="mb-2 block text-sm font-medium">
                Due Date & Time <span className="text-primary">*</span>
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={task.formData.dueDate}
                  onChange={(event) => task.updateField("dueDate", event.target.value)}
                  className="h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none"
                />
                <input
                  type="time"
                  value={task.formData.dueTime}
                  onChange={(event) => task.updateField("dueTime", event.target.value)}
                  className="h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                Urgency Level <span className="text-primary">*</span>
                <Info className="h-3.5 w-3.5 text-[#9ca3af]" />
              </span>
              <div className="grid gap-3 sm:grid-cols-4">
                {task.urgencyLevels.map((level) => {
                  const Icon = icons[level.icon as keyof typeof icons];
                  const active = task.formData.urgency === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => task.selectUrgency(level.id as UrgencyLevel)}
                      className={cn(
                        "flex h-[74px] flex-col items-center justify-center rounded-lg border bg-white text-sm font-medium",
                        active && "border-primary bg-orange-50 text-primary",
                      )}
                    >
                      <Icon className="mb-2 h-4 w-4" />
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-white px-7 py-4">
        <Button variant="outline" onClick={task.cancel} className="h-14 px-6">
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={task.saveTask} className="h-14 px-7">
          <Check className="h-4 w-4" />
          Save Task
        </Button>
      </footer>
    </div>
  );
}
