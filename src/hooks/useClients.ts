"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClient, deleteClientById, fetchClients, updateClient,
  type Client, type ClientFilters, type CreateClientInput, type UpdateClientInput,
} from "@/services/client.service";

export const CLIENTS_KEY = ["clients"] as const;
const clientKeys = (f: ClientFilters = {}) => [...CLIENTS_KEY, f] as const;

export function useClientList(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: clientKeys(filters),
    queryFn:  () => fetchClients(filters),
    staleTime: 30_000,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

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
    onSettled: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClientById(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CLIENTS_KEY });
      const prev = qc.getQueriesData<Client[]>({ queryKey: CLIENTS_KEY });
      qc.setQueriesData<Client[]>({ queryKey: CLIENTS_KEY }, (old) =>
        old?.filter((c) => c.id !== id) ?? old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([k, d]) => qc.setQueryData(k, d));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}
