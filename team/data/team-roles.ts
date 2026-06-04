import type { TeamRole } from "../types/team-types";

export const roles: TeamRole[] = [
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Lead projects and assign work.",
    count: 8,
  },
  {
    id: "team-lead",
    name: "Team Lead",
    description: "Coordinate team delivery and reviews.",
    count: 5,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Build features and update assigned work.",
    count: 15,
  },
  {
    id: "designer",
    name: "Designer",
    description: "Create product and campaign assets.",
    count: 6,
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Manage billing, invoices, and expenses.",
    count: 3,
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to shared workspace data.",
    count: 12,
  },
];
