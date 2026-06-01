import { Task } from "../../types/task-types";

 
export const tasks: Task[] = [
  {
    id: "1",
    title: "Update brand guidelines documentation",
    description:
      "Review and update the brand guidelines to reflect the new color palette.",
    tags: ["Design", "Documentation"],
    assignee: "SC",
    dueDate: "Mar 15",
    status: "todo",
  },
  {
    id: "2",
    title: "Create social media content calendar",
    description:
      "Plan and schedule social media posts for Q2 2026.",
    tags: ["Social", "Content"],
    assignee: "MT",
    dueDate: "Mar 18",
    status: "todo",
  },
  {
    id: "3",
    title: "Design new landing page layout",
    description:
      "Create mockups for the new product landing page.",
    tags: ["Design", "Web"],
    assignee: "MT",
    dueDate: "Mar 17",
    status: "planning",
  },
  {
    id: "4",
    title: "Client onboarding documentation",
    description:
      "Prepare onboarding materials for new clients.",
    tags: ["Client", "Process"],
    assignee: "ED",
    dueDate: "Mar 19",
    status: "planning",
  },
  {
    id: "5",
    title: "Develop new email template system",
    description:
      "Build responsive email templates for campaigns.",
    tags: ["Development", "Email"],
    assignee: "MT",
    dueDate: "Mar 14",
    status: "doing",
  },
  {
    id: "6",
    title: "Audit social media accounts",
    description:
      "Review engagement metrics and account settings.",
    tags: ["Social", "Analytics"],
    assignee: "ED",
    dueDate: "Mar 16",
    status: "doing",
  },
  {
    id: "7",
    title: "Finalize Q1 marketing report",
    description:
      "Prepare final report for management review.",
    tags: ["Marketing"],
    assignee: "SC",
    dueDate: "Mar 20",
    status: "review",
  },
];