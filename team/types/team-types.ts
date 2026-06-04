export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

export interface TeamRole {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface PendingInvite {
  id: string;
  email: string;
  invitedAt: string;
}
