"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { activityLogs as activityLogsData } from "../data/activity-log";
import { relatedEntities as relatedEntitiesData } from "../data/related-entities";
import { reviewers as reviewersData } from "../data/reviewers";
import {
  assigneeOptions,
  breadcrumbs,
  dueDateOptions,
  stageOptions,
  taskDetails,
} from "../data/task-details";

export function useTaskDetails() {
  const router = useRouter();
  const [task, setTask] = useState(taskDetails);
  const [stage, setStage] = useState(taskDetails.stage);
  const [assignee, setAssignee] = useState(taskDetails.assignedTo);
  const [dueDate, setDueDate] = useState(taskDetails.dueDate);
  const [reviewers] = useState(reviewersData);
  const [activityLogs] = useState(activityLogsData);
  const [relatedEntities] = useState(relatedEntitiesData);

  const updateStage = useCallback((value: string) => {
    setStage(value);
    setTask((current) => ({ ...current, stage: value }));
  }, []);

  const updateAssignee = useCallback((value: string) => {
    setAssignee(value);
    setTask((current) => ({ ...current, assignedTo: value }));
  }, []);

  const updateDueDate = useCallback((value: string) => {
    setDueDate(value);
    setTask((current) => ({ ...current, dueDate: value }));
  }, []);

  const handleBack = useCallback(() => {
    router.push("/dashboard/tasks");
  }, [router]);

  const handleSave = useCallback(() => {
    console.log(task);
  }, [task]);

  const handleMore = useCallback(() => {
    console.log("More");
  }, []);

  return {
    task,
    breadcrumbs,
    stage,
    assignee,
    dueDate,
    stageOptions,
    assigneeOptions,
    dueDateOptions,
    reviewers,
    activityLogs,
    relatedEntities,
    updateStage,
    updateAssignee,
    updateDueDate,
    handleBack,
    handleSave,
    handleMore,
  };
}
