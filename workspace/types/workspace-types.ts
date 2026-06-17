export type WorkspacePlan = "free" | "starter" | "pro" | "enterprise";

export type WorkspaceStatus = "active" | "inactive" | "suspended";

export type WorkspaceFormData = {
  name: string;
  businessType: string;
  timezone: string;
  currency: string;
};

export type WorkspaceValidationErrors = Partial<
  Record<keyof WorkspaceFormData, string>
>;

export type WorkspaceEntity = {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  timezone: string;
  currency: string;
  plan: WorkspacePlan;
  status: WorkspaceStatus;
  createdAt: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export const defaultWorkspaceRoles = [
  "Owner",
  "Admin",
  "Manager",
  "Member",
  "Viewer",
] as const;

export const defaultTaskStatuses = [
  "To Do",
  "Planning",
  "Doing",
  "Review",
  "Done",
] as const;
