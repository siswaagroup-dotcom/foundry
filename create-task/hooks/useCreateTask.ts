"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useCreateTask as useCreateTaskMutation } from "@/hooks/useTasks";
import { taskFormConfig } from "../data/task-form-config";
import { urgencyLevels } from "../data/urgency-levels";
import type { CreateTaskFormData, UrgencyLevel } from "../types/task-types";

// Map the UI urgency labels to DB priority values
const URGENCY_TO_PRIORITY: Record<UrgencyLevel, string> = {
  Low:      "low",
  Medium:   "medium",
  High:     "high",
  Critical: "urgent",
};

export function useCreateTask() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateTaskMutation();

  const [formData, setFormData] = useState<CreateTaskFormData>({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    urgency: taskFormConfig.defaultUrgency,
  });

  const validation = useMemo(
    () => ({
      title: formData.title.trim().length > 0,
      description: true,
      dueDate: formData.dueDate.trim().length > 0,
      dueTime: true,
    }),
    [formData]
  );

  const updateField = useCallback(
    (field: keyof CreateTaskFormData, value: string) => {
      setFormData((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const selectUrgency = useCallback((urgency: UrgencyLevel) => {
    setFormData((current) => ({ ...current, urgency }));
  }, []);

  const cancel = useCallback(() => {
    router.push("/dashboard/tasks");
  }, [router]);

  const saveTask = useCallback(async () => {
    if (!formData.title.trim()) {
      toast({ title: "Title is required", variant: "error" });
      return;
    }

    // Build ISO due date if provided
    let dueDate: string | undefined;
    if (formData.dueDate) {
      const iso = formData.dueTime
        ? `${formData.dueDate}T${formData.dueTime}`
        : `${formData.dueDate}T00:00:00`;
      dueDate = new Date(iso).toISOString();
    }

    try {
      await createMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: URGENCY_TO_PRIORITY[formData.urgency] as "low" | "medium" | "high" | "urgent",
        dueDate,
        status: "todo",
      });
      toast({ title: "Task created", variant: "success" });
      router.push("/dashboard/tasks");
    } catch (err) {
      toast({
        title: "Failed to create task",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }, [formData, createMutation, toast, router]);

  return {
    formData,
    validation,
    config: taskFormConfig,
    urgencyLevels,
    updateField,
    selectUrgency,
    cancel,
    saveTask,
    isLoading: createMutation.isPending,
  };
}
