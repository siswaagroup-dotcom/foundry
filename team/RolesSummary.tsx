import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { RoleCard } from "./RoleCard";
import type { TeamRole } from "./types/team-types";

type RolesSummaryProps = {
  roles: TeamRole[];
};

export function RolesSummary({ roles }: RolesSummaryProps) {
  return (
    <DashboardCard title="Role Summary">
      <div className="space-y-3">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </DashboardCard>
  );
}
