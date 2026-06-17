// =============================================================================
// CLIENT TYPES — shared between client and server
// Must NOT import any server-only or Node.js modules.
// =============================================================================

export type ClientTier     = "enterprise" | "premium" | "standard";
export type ClientPriority = "high" | "normal";
export type ClientTag      = "Enterprise" | "Premium" | "Verified" | "Standard";

export interface ClientContact {
  id:        string;
  clientId:  string;
  name:      string;
  email:     string | null;
  phone:     string | null;
  role:      string | null;
  isPrimary: boolean;
}

export interface Client {
  id:           string;
  workspaceId:  string;
  name:         string;
  companyName:  string | null;
  industry:     string | null;
  email:        string | null;
  phone:        string | null;
  location:     string | null;
  timezone:     string | null;
  tier:         ClientTier;
  priority:     ClientPriority;
  clientSince:  string | null;   // ISO date string
  notes:        string | null;
  tags:         string[];
  contacts:     ClientContact[];
  createdBy:    string;
  createdAt:    string;
  updatedAt:    string;
  // Derived UI helpers (computed from DB data)
  initials:     string;
  contact:      string;           // primary contact name or fallback
  activity:     string;           // human-readable last-active string
  activityTone: "green" | "yellow" | "gray";
  activeProject: boolean;
  lastActivityDays: number;
}

export interface CreateClientInput {
  name:         string;
  companyName?: string;
  industry?:    string;
  email?:       string;
  phone?:       string;
  location?:    string;
  timezone?:    string;
  tier?:        ClientTier;
  priority?:    ClientPriority;
  notes?:       string;
  tags?:        string[];
  // Primary contact
  contactName?:  string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateClientInput {
  name?:        string;
  companyName?: string;
  industry?:    string;
  email?:       string | null;
  phone?:       string | null;
  location?:    string | null;
  timezone?:    string | null;
  tier?:        ClientTier;
  priority?:    ClientPriority;
  notes?:       string | null;
  tags?:        string[];
}

export interface ClientFilters {
  search?:   string;
  tier?:     ClientTier;
  priority?: ClientPriority;
  tag?:      string;
}
