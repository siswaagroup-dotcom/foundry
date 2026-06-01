import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { TaskWorkspace } from "@/components/dashboard/tasks/TaskWorkspace";

export default function TasksPage() {
  return (
    <DashboardShell>
      <TaskWorkspace />
    </DashboardShell>
  );
}
