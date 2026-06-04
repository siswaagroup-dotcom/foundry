import type { Reviewer } from "./types/task-details-types";

type ReviewerCardProps = {
  reviewer: Reviewer;
};

export function ReviewerCard({ reviewer }: ReviewerCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#f8fafc] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {reviewer.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{reviewer.name}</p>
        <p className="mt-1 truncate text-xs text-[#6b7280]">{reviewer.role}</p>
      </div>
      <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-primary">
        {reviewer.status}
      </span>
    </div>
  );
}
