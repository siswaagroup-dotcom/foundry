import { CrudModule } from "@/components/dashboard/CrudModule";
import { taskRecords } from "@/lib/module-records";

export default function TasksPage() {
  return (
    <CrudModule
      title="Tasks"
      description="Create, edit, complete, filter, search, sort, and delete team tasks."
      records={taskRecords}
      primaryAction="Create Task"
      searchPlaceholder="Search tasks..."
      statusOptions={["Todo", "In Progress", "Done", "Blocked"]}
      showComplete
    />
  );
}
