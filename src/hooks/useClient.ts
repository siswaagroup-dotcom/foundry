"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/services/client.service";

export const clientDetailKey = (id: string) => ["clients", "detail", id] as const;

export function useClient(id: string) {
  return useQuery({
    queryKey: clientDetailKey(id),
    queryFn:  () => fetchClient(id),
    enabled:  Boolean(id),
    staleTime: 30_000,
  });
}
