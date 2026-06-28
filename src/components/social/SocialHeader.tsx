import { Calendar, Link2, List, Plus } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { SocialView } from "./types/social-types";

type SocialHeaderProps = {
  selectedView: SocialView;
  onViewChange: (view: SocialView) => void;
  onCreatePost: () => void;
  onConnectedAccounts: () => void;
};

export const SocialHeader = memo(function SocialHeader({
  selectedView,
  onViewChange,
  onCreatePost,
  onConnectedAccounts,
}: SocialHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-[24px] font-bold leading-none text-[#0f172a]">
        Social
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex h-9 rounded-md bg-[#f4f5f7] p-0.5">
          {(["calendar", "list"] as SocialView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-semibold text-[#526173]",
                selectedView === view &&
                  "bg-white text-[#111827] shadow-sm"
              )}
            >
              {view === "calendar" ? (
                <Calendar className="h-3.5 w-3.5" />
              ) : (
                <List className="h-3.5 w-3.5" />
              )}
              {view === "calendar" ? "Calendar" : "List"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onConnectedAccounts}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-xs font-bold text-[#334155] transition hover:bg-[#f8fafc]"
        >
          <Link2 className="h-3.5 w-3.5" />
          Connected Accounts
        </button>

        <button
          type="button"
          onClick={onCreatePost}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#f15a24] px-5 text-xs font-bold text-white shadow-[0_5px_12px_rgba(241,90,36,0.24)] transition hover:bg-[#e95420]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Post
        </button>
      </div>
    </header>
  );
});
