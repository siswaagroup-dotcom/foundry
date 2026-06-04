import type { UrgencyOption } from "../types/task-types";

export const urgencyLevels: UrgencyOption[] = [
  { id: "Low", label: "Low", icon: "check" },
  { id: "Medium", label: "Medium", icon: "alert" },
  { id: "High", label: "High", icon: "triangle" },
  { id: "Critical", label: "Critical", icon: "warning" },
];
