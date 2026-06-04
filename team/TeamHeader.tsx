import { Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type TeamHeaderProps = {
  onConfigureRoles: () => void;
  onInviteMember: () => void;
};

export function TeamHeader({
  onConfigureRoles,
  onInviteMember,
}: TeamHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold">Team & Roles</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Add members, assign roles, edit permissions, and remove users.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onConfigureRoles}>
          <Settings className="h-4 w-4" />
          Configure Roles
        </Button>
        <Button onClick={onInviteMember}>
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>
    </div>
  );
}
