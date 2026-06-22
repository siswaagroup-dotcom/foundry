"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClient, deleteClientById, fetchClients, fetchCrmPipeline,
  fetchFilterCounts, updateClient,
  type Client, type ClientFilters, type CreateClientInput,
  type CrmStage, type UpdateClientInput,
} from "@/services/client.service";

export const CLIENTS_KEY      = ["clients"] as const;
export const PIPELINE_KEY     = ["clients", "pipeline"] as const;
export const FILTER_COUNTS_KEY = ["clients", "filter-counts"] as const;

const clientKeys = (f: ClientFilters = {}) => [...CLIENTS_KEY, f] as const;

// ─── useClientList ────────────────────────────────────────────────────────────
export function useClientList(filters: ClientFilters = {}) {
  return useQuery({
    queryKey:  clientKeys(filters),
    queryFn:   () => fetchClients(filters),
    staleTime: 30_000,
  });
}

// ─── useCrmPipeline ───────────────────────────────────────────────────────────
export function useCrmPipeline() {
  return useQuery({
    queryKey:  PIPELINE_KEY,
    queryFn:   fetchCrmPipeline,
    staleTime: 30_000,
  });
}

// ─── useClientFilterCounts ────────────────────────────────────────────────────
export function useClientFilterCounts() {
  return useQuery({
    queryKey:  FILTER_COUNTS_KEY,
    queryFn:   fetchFilterCounts,
    staleTime: 60_000,
  });
}

// ─── useCreateClient ──────────────────────────────────────────────────────────
export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY });
      qc.invalidateQueries({ queryKey: PIPELINE_KEY });
      qc.invalidateQueries({ queryKey: FILTER_COUNTS_KEY });
    },
  });
}

// ─── useUpdateClient ──────────────────────────────────────────────────────────
export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClientInput }) => updateClient(id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: CLIENTS_KEY });
      const prev = qc.getQueriesData<Client[]>({ queryKey: CLIENTS_KEY });
      qc.setQueriesData<Client[]>({ queryKey: CLIENTS_KEY }, (old) =>
        old?.map((c) => c.id === id ? { ...c, ...input } : c) ?? old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([k, d]) => qc.setQueryData(k, d));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY });
      qc.invalidateQueries({ queryKey: PIPELINE_KEY });
    },
  });
}

// ─── useUpdateCrmStatus ───────────────────────────────────────────────────────
// Optimistic pipeline stage update — same pattern as useUpdateTask for Kanban
export function useUpdateCrmStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, crmStatus }: { id: string; crmStatus: CrmStage }) =>
      updateClient(id, { crmStatus }),
    onMutate: async ({ id, crmStatus }) => {
      await qc.cancelQueries({ queryKey: PIPELINE_KEY });
      const prevPipeline = qc.getQueryData<Record<CrmStage, Client[]>>(PIPELINE_KEY);
      // Optimistically move client between pipeline columns
      if (prevPipeline) {
        const next = structuredClone(prevPipeline) as Record<CrmStage, Client[]>;
        let moved: Client | undefined;
        for (const stage of Object.keys(next) as CrmStage[]) {
          const idx = next[stage].findIndex((c) => c.id === id);
          if (idx !== -1) { moved = next[stage].splice(idx, 1)[0]; break; }
        }
        if (moved) next[crmStatus].unshift({ ...moved, crmStatus });
        qc.setQueryData(PIPELINE_KEY, next);
      }
      return { prevPipeline };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevPipeline) qc.setQueryData(PIPELINE_KEY, ctx.prevPipeline);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PIPELINE_KEY });
      qc.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}

// ─── useDeleteClient ──────────────────────────────────────────────────────────
export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClientById(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CLIENTS_KEY });
      const prev = qc.getQueriesData<Client[]>({ queryKey: CLIENTS_KEY });
      qc.setQueriesData<Client[]>({ queryKey: CLIENTS_KEY }, (old) => old?.filter((c) => c.id !== id) ?? old);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([k, d]) => qc.setQueryData(k, d));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY });
      qc.invalidateQueries({ queryKey: PIPELINE_KEY });
      qc.invalidateQueries({ queryKey: FILTER_COUNTS_KEY });
    },
  });
}
