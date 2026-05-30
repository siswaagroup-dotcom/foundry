import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { CrudModule } from "@/components/dashboard/CrudModule";
import { reportRecords } from "@/lib/module-records";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <CrudModule
        title="Reports"
        description="Revenue, expense, productivity, and client growth reports."
        records={reportRecords}
        primaryAction="Create Report"
        searchPlaceholder="Search reports..."
        statusOptions={["Ready", "Draft", "Scheduled"]}
      />
      <AnalyticsCharts />
    </div>
  );
}
