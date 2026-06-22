// Saved filter definitions — counts are now fetched live from /api/clients/filter-counts
// See useClientFilterCounts() hook.
import type { SavedClientFilter } from "../types/client-types";

export const savedClientFilters: SavedClientFilter[] = [
  { id: "enterprise-clients", name: "Enterprise Clients", count: 0, criteria: { tier: "enterprise" } },
  { id: "active-this-week",   name: "Active This Week",   count: 0, criteria: { maxActivityDays: 7  } },
  { id: "high-priority",      name: "High Priority",      count: 0, criteria: { priority: "high"    } },
  { id: "premium-tier",       name: "Premium Tier",       count: 0, criteria: { tier: "premium"     } },
  { id: "inactive-30-days",   name: "Inactive 30+ days",  count: 0, criteria: { minActivityDays: 30 } },
];
