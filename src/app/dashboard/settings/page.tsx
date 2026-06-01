import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CrudModule } from "@/components/dashboard/CrudModule";
import { settingsRecords } from "@/lib/module-records";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <CrudModule
        title="Settings"
        description="Manage profile, workspace, billing, notification, and security settings."
        records={settingsRecords}
        primaryAction="Add Setting"
        searchPlaceholder="Search settings..."
        statusOptions={[
          "Enabled",
          "Disabled",
          "Action Required",
        ]}
      />
    </DashboardShell>
  );
}