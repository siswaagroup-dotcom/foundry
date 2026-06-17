export type UserRole = "owner" | "admin" | "manager" | "member" | "viewer";

export type UserStatus = "active" | "invited" | "disabled";

export type UserEntity = {
  id: string;
  workspaceId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProfileData = {
  fullName: string;
  email: string;
  avatarUrl: string;
  photoFile: File | null;
};

export type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ProfileErrors = Partial<Record<keyof ProfileData, string>>;

export type PasswordErrors = Partial<Record<keyof PasswordData, string>>;
