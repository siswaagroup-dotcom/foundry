import type { WorkspaceRole } from "@/types/team";

export const editableRoles: Exclude<WorkspaceRole, "Owner">[] = ["Admin", "Manager", "Member", "Viewer"];
