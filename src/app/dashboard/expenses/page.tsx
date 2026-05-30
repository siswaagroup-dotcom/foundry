import { CrudModule } from "@/components/dashboard/CrudModule";
import { expenseRecords } from "@/lib/module-records";

export default function ExpensesPage() {
  return (
    <CrudModule
      title="Expenses"
      description="Manage expenses, categories, approvals, and status tracking."
      records={expenseRecords}
      primaryAction="Add Expense"
      searchPlaceholder="Search expenses..."
      statusOptions={["Planned", "Submitted", "Approved", "Pending"]}
    />
  );
}
