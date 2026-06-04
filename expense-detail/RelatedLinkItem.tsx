import { ChevronRight } from "lucide-react";
import type { RelatedLink } from "./types/expense-detail-types";

type RelatedLinkItemProps = {
  link: RelatedLink;
  onClick: (id: string) => void;
};

export function RelatedLinkItem({ link, onClick }: RelatedLinkItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(link.id)}
      className="flex w-full items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-left text-sm font-medium hover:bg-[#f8fafc]"
    >
      {link.title}
      <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
    </button>
  );
}
