import { FileText, Heart, Pencil, UserPlus } from "lucide-react";
import type { ActivityLogItem } from "./types/task-details-types";

type ActivityItemProps = {
  item: ActivityLogItem;
};

const icons = {
  assign: UserPlus,
  comment: UserPlus,
  create: FileText,
  edit: Pencil,
  reviewer: Heart,
};

export function ActivityItem({ item }: ActivityItemProps) {
  const Icon = icons[item.type as keyof typeof icons] ?? FileText;

  return (
    <div className="flex gap-3 border-b border-[#edf0f3] py-3 last:border-0">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-sm font-semibold">
          {item.user} <span className="font-medium">{item.action}</span>
        </p>
        <p className="mt-1 text-xs text-[#9ca3af]">{item.timestamp}</p>
      </div>
    </div>
  );
}
