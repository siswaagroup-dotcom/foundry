export type ClientTag =
  | "Enterprise"
  | "Premium"
  | "Verified"
  | "Standard";

export type Client = {
  id: string;
  initials: string;
  name: string;
  industry: string;
  contact: string;
  activity: string;
  activityTone: "green" | "yellow" | "gray";
  tags: ClientTag[];
  activeProject: boolean;
  priority: "high" | "normal";
  tier: "enterprise" | "premium" | "standard";
  lastActivityDays: number;
};

export type ClientFilterId =
  | "all"
  | "active-projects"
  | "enterprise"
  | "premium"
  | "recent-activity";

export type SavedClientFilterId =
  | "enterprise-clients"
  | "active-this-week"
  | "high-priority"
  | "premium-tier"
  | "inactive-30-days";

export type ClientFilter = {
  id: ClientFilterId;
  label: string;
  criteria: Partial<ClientFilterCriteria>;
};

export type SavedClientFilter = {
  id: SavedClientFilterId;
  name: string;
  count: number;
  criteria: Partial<ClientFilterCriteria>;
};

export type ClientFilterCriteria = {
  activeProject: boolean;
  tag: ClientTag;
  tier: Client["tier"];
  priority: Client["priority"];
  maxActivityDays: number;
  minActivityDays: number;
};
