import type { ClientFilter } from "../types/client-types";

export const clientFilters: ClientFilter[] = [
  {
    id: "all",
    label: "All Clients",
    criteria: {},
  },
  {
    id: "active-projects",
    label: "Active Projects",
    criteria: { activeProject: true },
  },
  {
    id: "enterprise",
    label: "Enterprise",
    criteria: { tag: "Enterprise" },
  },
  {
    id: "premium",
    label: "Premium",
    criteria: { tag: "Premium" },
  },
  {
    id: "recent-activity",
    label: "Recent Activity",
    criteria: { maxActivityDays: 1 },
  },
];
