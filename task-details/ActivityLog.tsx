import { History } from "lucide-react";
import { ActivityItem } from "./ActivityItem";
import type { ActivityLogItem } from "./types/task-details-types";

type ActivityLogProps = {
  activityLogs: ActivityLogItem[];
};

export function ActivityLog({ activityLogs }: ActivityLogProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Activity Log</h3>
      </div>

      <div>
        {activityLogs.map((item) => (
          <ActivityItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
