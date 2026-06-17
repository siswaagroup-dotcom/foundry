export const profileConfig = {
  avatar: {
    maxSizeMb: 2,
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
    acceptAttribute: "image/jpeg,image/png,image/webp",
  },
  validation: {
    minNameLength: 2,
    minPasswordLength: 8,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  defaults: {
    user: {
      id: "user_001",
      workspaceId: "workspace_001",
      fullName: "Atul Sharma",
      email: "atul@company.com",
      avatarUrl: "",
      role: "owner",
      status: "active",
    },
  },
} as const;
