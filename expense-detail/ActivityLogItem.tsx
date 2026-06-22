import { Check, FileText, Paperclip, Plus, XCircle } from "lucide-react";
import type { ActivityLogItem as Activity } from "./types/expense-detail-types";

type ActivityLogItemProps = {
  activity: Activity;
};

const icons = {
  approved: Check,
  attachment: Paperclip,
  created: Plus,
  note: FileText,
  rejected: XCircle,
};

export function ActivityLogItem({ activity }: ActivityLogItemProps) {
  const Icon = icons[activity.type as keyof typeof icons] ?? FileText;

  return (
    <div className="flex gap-3 border-b border-[#edf0f3] py-3 last:border-0">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{activity.action}</p>
        <p className="mt-1 text-xs text-[#9ca3af]">{activity.timestamp}</p>
      </div>
    </div>
  );
}
