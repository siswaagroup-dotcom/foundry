import { Circle } from "lucide-react";
import type { ActivityLogItem as Activity } from "./types/social-post-detail-types";

type ActivityLogItemProps = {
  activity: Activity;
};

export function ActivityLogItem({ activity }: ActivityLogItemProps) {
  return (
    <div className="flex gap-3 border-b border-[#edf0f3] py-4 last:border-0">
      <div className="relative flex w-4 justify-center">
        <span className="absolute top-5 h-full w-px bg-[#e5e7eb]" />
        <Circle className="relative z-10 mt-1 h-3 w-3 fill-primary text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-primary">
          {activity.user}{" "}
          <span className="font-medium text-[#111827]">{activity.action}</span>
        </p>
        <p className="mt-1 text-xs text-[#9ca3af]">{activity.timestamp}</p>
      </div>
    </div>
  );
}
