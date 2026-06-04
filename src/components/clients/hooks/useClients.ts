"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { clientFilters } from "../data/client-filters";
import { clients } from "../data/clients-data";
import { savedClientFilters } from "../data/saved-filters";
import type {
  Client,
  ClientFilterCriteria,
  ClientFilterId,
  SavedClientFilterId,
} from "../types/client-types";
function matchesCriteria(
  client: Client,
  criteria: Partial<ClientFilterCriteria>
) {
  return [
    criteria.activeProject === undefined ||
      client.activeProject === criteria.activeProject,
    !criteria.tag || client.tags.includes(criteria.tag),
    !criteria.tier || client.tier === criteria.tier,
    !criteria.priority ||
      client.priority === criteria.priority,
    criteria.maxActivityDays === undefined ||
      client.lastActivityDays <= criteria.maxActivityDays,
    criteria.minActivityDays === undefined ||
      client.lastActivityDays >= criteria.minActivityDays,
  ].every(Boolean);
}

export function useClients() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<ClientFilterId>("all");
  const [activeSavedFilter, setActiveSavedFilter] = useState<
    SavedClientFilterId | null
  >(null);
  const deferredSearch = useDeferredValue(search);

  const filteredClients = useMemo(() => {
    const tab = clientFilters.find(
      (filter) => filter.id === activeFilter
    );
    const saved = savedClientFilters.find(
      (filter) => filter.id === activeSavedFilter
    );
    const term = deferredSearch.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !term ||
        client.name.toLowerCase().includes(term);

      return (
        matchesSearch &&
        matchesCriteria(client, tab?.criteria ?? {}) &&
        matchesCriteria(client, saved?.criteria ?? {})
      );
    });
  }, [activeFilter, activeSavedFilter, deferredSearch]);

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
    selectFilter,
    selectSavedFilter,
  };
}
