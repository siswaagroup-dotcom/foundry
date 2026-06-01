import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CrudModule } from "@/components/dashboard/CrudModule";
import { teamRecords } from "@/lib/module-records";

export default function TeamPage() {
  return (
    <DashboardShell>
      <CrudModule
        title="Team & Roles"
        description="Add members, assign roles, edit permissions, and remove users."
        records={teamRecords}
        primaryAction="Add Team Member"
        searchPlaceholder="Search team members..."
        statusOptions={[
          "Online",
          "Away",
          "Offline",
        ]}
      />
    </DashboardShell>
  );
}