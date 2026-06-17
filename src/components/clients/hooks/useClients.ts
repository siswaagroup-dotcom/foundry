"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useClientList } from "@/hooks/useClients";
import { clientFilters } from "../data/client-filters";
import { savedClientFilters } from "../data/saved-filters";
import type {
  ClientFilter,
  ClientFilterCriteria,
  ClientFilterId,
  SavedClientFilterId,
} from "../types/client-types";
import type { Client } from "../types/client-types";

// Map API Client shape → UI Client shape (they are compatible —
// both share id, name, industry, email, phone, location, contact,
// activity, activityTone, tags, activeProject, priority, tier, lastActivityDays)
// The API Client type from src/types/client.ts and the UI Client type from
// src/components/clients/types/client-types.ts are structurally compatible.

function matchesCriteria(
  client: Client,
  criteria: Partial<ClientFilterCriteria>
): boolean {
  return [
    criteria.activeProject === undefined || client.activeProject === criteria.activeProject,
    !criteria.tag      || client.tags.includes(criteria.tag),
    !criteria.tier     || client.tier === criteria.tier,
    !criteria.priority || client.priority === criteria.priority,
    criteria.maxActivityDays === undefined || client.lastActivityDays <= criteria.maxActivityDays,
    criteria.minActivityDays === undefined || client.lastActivityDays >= criteria.minActivityDays,
  ].every(Boolean);
}

export function useClients() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ClientFilterId>("all");
  const [activeSavedFilter, setActiveSavedFilter] = useState<SavedClientFilterId | null>(null);

  const deferredSearch = useDeferredValue(search);

  // Fetch from API — no static data
  const { data: allClients = [], isLoading } = useClientList();

  const filteredClients = useMemo(() => {
    const tab   = clientFilters.find((f) => f.id === activeFilter);
    const saved = savedClientFilters.find((f) => f.id === activeSavedFilter);
    const term  = deferredSearch.trim().toLowerCase();

    return (allClients as Client[]).filter((client) => {
      const matchesSearch = !term || client.name.toLowerCase().includes(term);
      return (
        matchesSearch &&
        matchesCriteria(client, tab?.criteria  ?? {}) &&
        matchesCriteria(client, saved?.criteria ?? {})
      );
    });
  }, [allClients, activeFilter, activeSavedFilter, deferredSearch]);

  const selectFilter = useCallback((filter: ClientFilterId) => {
    setActiveFilter(filter);
    setActiveSavedFilter(null);
  }, []);

  const selectSavedFilter = useCallback((filter: SavedClientFilterId) => {
    setActiveFilter("all");
    setActiveSavedFilter(filter);
  }, []);

  return {
    search,
    setSearch,
    activeFilter,
    activeSavedFilter,
    filteredClients,
    clientFilters,
    savedClientFilters,
    isLoading,
    selectFilter,
    selectSavedFilter,
  };
}
