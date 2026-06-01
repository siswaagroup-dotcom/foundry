import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CrudModule } from "@/components/dashboard/CrudModule";
import { clientRecords } from "@/lib/module-records";

export default function ClientsPage() {
  return (
    <DashboardShell>
      <CrudModule
        title="Clients"
        description="Track client profiles, contact information, status, and revenue."
        records={clientRecords}
        primaryAction="Add Client"
        searchPlaceholder="Search clients..."
        statusOptions={[
          "Active",
          "At Risk",
          "Onboarding",
          "Paused",
        ]}
      />
    </DashboardShell>
  );
}