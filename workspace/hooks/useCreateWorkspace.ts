"use client";

import { useMemo, useState } from "react";
import type {
  WorkspaceEntity,
  WorkspaceFormData,
  WorkspaceValidationErrors,
} from "../types/workspace-types";

const initialFormData: WorkspaceFormData = {
  name: "",
  businessType: "",
  timezone: "",
  currency: "",
};

function createSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildWorkspaceEntity(formData: WorkspaceFormData): WorkspaceEntity {
  return {
    id: crypto.randomUUID(),
    name: formData.name.trim(),
    slug: createSlug(formData.name),
    businessType: formData.businessType,
    timezone: formData.timezone,
    currency: formData.currency,
    plan: "free",
    status: "active",
    createdAt: new Date().toISOString(),
  };
}

export function useCreateWorkspace() {
  const [formData, setFormData] = useState<WorkspaceFormData>(initialFormData);
  const [errors, setErrors] = useState<WorkspaceValidationErrors>({});

  const workspacePreview = useMemo(
    () => buildWorkspaceEntity(formData),
    [formData],
  );

  function updateField(field: keyof WorkspaceFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors: WorkspaceValidationErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Workspace name is required.";
    }

    if (!formData.businessType) {
      nextErrors.businessType = "Business type is required.";
    }

    if (!formData.timezone) {
      nextErrors.timezone = "Timezone is required.";
    }

    if (!formData.currency) {
      nextErrors.currency = "Currency is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function createWorkspace() {
    if (!validate()) return;

    console.log(formData);
    return workspacePreview;
  }

  function cancel() {
    console.log("Cancel");
  }

  return { formData, errors, updateField, createWorkspace, cancel };
}
