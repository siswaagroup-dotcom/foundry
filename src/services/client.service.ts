// =============================================================================
// CLIENT SERVICE — client-side fetch wrapper
// =============================================================================
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Client, ClientFilters, ClientTimelineEvent,
  CreateClientInput, UpdateClientInput, CrmStage,
} from "@/types/client";

export type { Client, ClientFilters, ClientTimelineEvent, CreateClientInput, UpdateClientInput, CrmStage };
export type { ClientTier, ClientPriority, ClientTag, CRM_STAGES } from "@/types/client";

const BASE = "/api/clients";

function buildQuery(f: ClientFilters = {}): string {
  const p = new URLSearchParams();
  if (f.search)    p.set("search",    f.search);
  if (f.tier)      p.set("tier",      f.tier);
  if (f.priority)  p.set("priority",  f.priority);
  if (f.tag)       p.set("tag",       f.tag);
  if (f.crmStatus) p.set("crmStatus", f.crmStatus);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export const fetchClients        = (f?: ClientFilters): Promise<Client[]>     => apiGet(`${BASE}${buildQuery(f)}`);
export const fetchClient         = (id: string): Promise<Client>               => apiGet(`${BASE}/${id}`);
export const createClient        = (input: CreateClientInput): Promise<Client> => apiPost(BASE, input);
export const updateClient        = (id: string, input: UpdateClientInput): Promise<Client> => apiPatch(`${BASE}/${id}`, input);
export const deleteClientById    = (id: string): Promise<{ id: string }>       => apiDelete(`${BASE}/${id}`);
export const fetchCrmPipeline    = (): Promise<Record<CrmStage, Client[]>>     => apiGet(`${BASE}/pipeline`);
export const fetchClientTimeline = (id: string): Promise<ClientTimelineEvent[]> => apiGet(`${BASE}/${id}/timeline`);
export const fetchFilterCounts   = (): Promise<{
  enterpriseClients: number; activeThisWeek: number;
  highPriority: number; premiumTier: number; inactive30Days: number;
}> => apiGet(`${BASE}/filter-counts`);
