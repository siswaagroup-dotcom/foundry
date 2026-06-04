import { CalendarDays, ChevronRight, Users } from "lucide-react";
import type { RelatedItem as Related } from "./types/social-post-detail-types";

type RelatedItemProps = {
  item: Related;
  onClick: (id: string) => void;
};

export function RelatedItem({ item, onClick }: RelatedItemProps) {
  const Icon = item.id === "social-calendar" ? CalendarDays : Users;

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className="flex w-full items-center gap-3 border-b border-[#edf0f3] px-5 py-4 text-left last:border-0 hover:bg-[#f8fafc]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{item.title}</span>
        <span className="mt-1 block truncate text-xs text-[#6b7280]">
          {item.subtitle}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
    </button>
  );
}
