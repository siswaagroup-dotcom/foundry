import { ActivityLogItem } from "./ActivityLogItem";
import type { ActivityLogItem as Activity } from "./types/social-post-detail-types";

type ActivityLogProps = {
  activityLog: Activity[];
};

export function ActivityLog({ activityLog }: ActivityLogProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <h3 className="text-base font-bold">Activity Log</h3>
      </div>
      <div className="px-5">
        {activityLog.map((activity) => (
          <ActivityLogItem key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
