export type UrgencyLevel = "Low" | "Medium" | "High" | "Critical";

export interface UrgencyOption {
  id: UrgencyLevel;
  label: UrgencyLevel;
  icon: string;
}

export interface TaskFormConfig {
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  descriptionHelper: string;
  defaultUrgency: UrgencyLevel;
}

export interface CreateTaskFormData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  urgency: UrgencyLevel;
}

export interface CreateTaskValidation {
  title: boolean;
  description: boolean;
  dueDate: boolean;
  dueTime: boolean;
}
