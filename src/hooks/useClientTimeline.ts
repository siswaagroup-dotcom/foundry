"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClientTimeline } from "@/services/client.service";

export function useClientTimeline(clientId: string) {
  return useQuery({
    queryKey:  ["clients", clientId, "timeline"],
    queryFn:   () => fetchClientTimeline(clientId),
    enabled:   Boolean(clientId),
    staleTime: 30_000,
  });
}
