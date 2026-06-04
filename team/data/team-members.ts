import type { TeamMember } from "../types/team-types";

export const teamMembers: TeamMember[] = [
  {
    id: "tm-1",
    name: "Sarah Miller",
    email: "sarah@foundry.com",
    role: "Owner",
    status: "Active",
    lastActive: "Now",
  },
  {
    id: "tm-2",
    name: "Marcus Lee",
    email: "marcus@foundry.com",
    role: "Admin",
    status: "Active",
    lastActive: "14 minutes ago",
  },
  {
    id: "tm-3",
    name: "Priya Shah",
    email: "priya@foundry.com",
    role: "Manager",
    status: "Away",
    lastActive: "1 hour ago",
  },
  {
    id: "tm-4",
    name: "Mina Chen",
    email: "mina@foundry.com",
    role: "Member",
    status: "Offline",
    lastActive: "Yesterday",
  },
  {
    id: "tm-5",
    name: "Owen Brooks",
    email: "owen@foundry.com",
    role: "Viewer",
    status: "Active",
    lastActive: "2 hours ago",
  },
];
