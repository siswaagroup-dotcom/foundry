import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ClientsWorkspace } from "@/components/clients/ClientsWorkspace";

export default function ClientsPage() {
  return (
    <DashboardShell>
      <ClientsWorkspace />
    </DashboardShell>
  );
}
