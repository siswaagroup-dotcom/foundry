// =============================================================================
// CLIENT TYPES — shared between client and server
// Must NOT import any server-only or Node.js modules.
// =============================================================================

export type ClientTier     = "enterprise" | "premium" | "standard";
export type ClientPriority = "high" | "normal";
export type ClientTag      = "Enterprise" | "Premium" | "Verified" | "Standard";

export type CrmStage =
  | "lead"
  | "qualified"
  | "proposal_sent"
  | "negotiation"
  | "advance_received"
  | "active_client"
  | "completed";

export const CRM_STAGES: { id: CrmStage; label: string }[] = [
  { id: "lead",             label: "Lead"             },
  { id: "qualified",        label: "Qualified Lead"   },
  { id: "proposal_sent",    label: "Proposal Sent"    },
  { id: "negotiation",      label: "Negotiation"      },
  { id: "advance_received", label: "Advance Received" },
  { id: "active_client",    label: "Active Client"    },
  { id: "completed",        label: "Completed"        },
];

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
  id:              string;
  workspaceId:     string;
  name:            string;
  companyName:     string | null;
  industry:        string | null;
  email:           string | null;
  phone:           string | null;
  location:        string | null;
  timezone:        string | null;
  tier:            ClientTier;
  priority:        ClientPriority;
  crmStatus:       CrmStage;         // NEW — pipeline stage
  quotedAmount:    number | null;    // NEW — deal value
  advanceReceived: number | null;    // NEW — advance paid
  paidAmount:      number | null;    // NEW — total paid
  pendingAmount:   number | null;    // DERIVED: quotedAmount - paidAmount
  clientSince:     string | null;
  notes:           string | null;
  tags:            string[];
  contacts:        ClientContact[];
  createdBy:       string;
  createdAt:       string;
  updatedAt:       string;
  // Derived UI helpers
  initials:         string;
  contact:          string;
  activity:         string;
  activityTone:     "green" | "yellow" | "gray";
  activeProject:    boolean;
  lastActivityDays: number;
  taskCount:        number;
  expenseTotal:     number;
}

export interface CreateClientInput {
  name:            string;
  companyName?:    string;
  industry?:       string;
  email?:          string;
  phone?:          string;
  location?:       string;
  timezone?:       string;
  tier?:           ClientTier;
  priority?:       ClientPriority;
  crmStatus?:      CrmStage;
  quotedAmount?:   number;
  advanceReceived?: number;
  paidAmount?:     number;
  notes?:          string;
  tags?:           string[];
  contactName?:    string;
  contactEmail?:   string;
  contactPhone?:   string;
}

export interface UpdateClientInput {
  name?:           string;
  companyName?:    string;
  industry?:       string;
  email?:          string | null;
  phone?:          string | null;
  location?:       string | null;
  timezone?:       string | null;
  tier?:           ClientTier;
  priority?:       ClientPriority;
  crmStatus?:      CrmStage;
  quotedAmount?:   number | null;
  advanceReceived?: number | null;
  paidAmount?:     number | null;
  notes?:          string | null;
  tags?:           string[];
}

export interface ClientFilters {
  search?:    string;
  tier?:      ClientTier;
  priority?:  ClientPriority;
  tag?:       string;
  crmStatus?: CrmStage;
}

// Timeline event — aggregated from tasks, expenses, social posts, status changes
export interface ClientTimelineEvent {
  id:        string;
  type:      "task" | "expense" | "social_post" | "status_change";
  title:     string;
  detail:    string | null;
  badge:     string | null;
  timestamp: string;
  actorName: string | null;
}
