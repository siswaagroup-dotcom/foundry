import type {
  BreadcrumbItem,
  SelectOption,
  TaskDetails,
} from "../types/task-details-types";

export const taskDetails: TaskDetails = {
  id: "logo-redesign",
  title: "Logo Redesign for Premium Client",
  description:
    "Create a modern, minimalist logo design for TechVision Corp, a premium software company. The logo should reflect innovation, trust, and professionalism. Deliverables include primary logo, variations, and brand guidelines document.",
  status: "In Progress",
  createdAt: "Jan 15, 2026",
  updatedAt: "Today, 2:35 PM",
  urgency: "High Priority",
  stage: "In Progress",
  assignedTo: "Sarah Kim (Designer)",
  dueDate: "01-02-2026 17:00",
};

export const breadcrumbs: BreadcrumbItem[] = [
  { id: "tasks", label: "Tasks" },
  { id: "current", label: taskDetails.title },
];

export const stageOptions: SelectOption[] = [
  { label: "Planning", value: "Planning" },
  { label: "In Progress", value: "In Progress" },
  { label: "Review", value: "Review" },
  { label: "Done", value: "Done" },
];

export const assigneeOptions: SelectOption[] = [
  { label: "Sarah Kim (Designer)", value: "Sarah Kim (Designer)" },
  { label: "Alex Chen (Manager)", value: "Alex Chen (Manager)" },
  { label: "Maya Patel (Brand Lead)", value: "Maya Patel (Brand Lead)" },
];

export const dueDateOptions: SelectOption[] = [
  { label: "01-02-2026 17:00", value: "01-02-2026 17:00" },
  { label: "02-02-2026 12:00", value: "02-02-2026 12:00" },
  { label: "05-02-2026 18:00", value: "05-02-2026 18:00" },
];
