import { History } from "lucide-react";
import { ActivityLogItem } from "./ActivityLogItem";
import type { ActivityLogItem as Activity } from "./types/expense-detail-types";

type ActivityLogProps = {
  activityLog: Activity[];
};

export function ActivityLog({ activityLog }: ActivityLogProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Activity Log</h3>
      </div>
      <div>
        {activityLog.map((activity) => (
          <ActivityLogItem key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
