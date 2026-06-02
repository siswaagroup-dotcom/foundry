import type { SavedClientFilter } from "../types/client-types";

export const savedClientFilters: SavedClientFilter[] = [
  {
    id: "enterprise-clients",
    name: "Enterprise Clients",
    count: 12,
    criteria: { tier: "enterprise" },
  },
  {
    id: "active-this-week",
    name: "Active This Week",
    count: 28,
    criteria: { maxActivityDays: 7 },
  },
  {
    id: "high-priority",
    name: "High Priority",
    count: 7,
    criteria: { priority: "high" },
  },
  {
    id: "premium-tier",
    name: "Premium Tier",
    count: 15,
    criteria: { tier: "premium" },
  },
  {
    id: "inactive-30-days",
    name: "Inactive 30+ days",
    count: 5,
    criteria: { minActivityDays: 30 },
  },
];
