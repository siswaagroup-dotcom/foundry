"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { taskFormConfig } from "../data/task-form-config";
import { urgencyLevels } from "../data/urgency-levels";
import type {
  CreateTaskFormData,
  UrgencyLevel,
} from "../types/task-types";

export function useCreateTask() {
  const router = useRouter();
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
      description: formData.description.trim().length > 0,
      dueDate: formData.dueDate.trim().length > 0,
      dueTime: formData.dueTime.trim().length > 0,
    }),
    [formData],
  );

  const updateField = useCallback(
    (field: keyof CreateTaskFormData, value: string) => {
      setFormData((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const selectUrgency = useCallback((urgency: UrgencyLevel) => {
    setFormData((current) => ({
      ...current,
      urgency,
    }));
  }, []);

  const cancel = useCallback(() => {
    router.push("/dashboard/tasks");
  }, [router]);

  const saveTask = useCallback(() => {
    console.log(formData);
  }, [formData]);

  return {
    formData,
    validation,
    config: taskFormConfig,
    urgencyLevels,
    updateField,
    selectUrgency,
    cancel,
    saveTask,
  };
}
