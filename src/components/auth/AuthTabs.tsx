"use client";

import { AUTH_TABS } from "@/constants/auth";
import type { AuthTabMode } from "@/types/auth";
import { cn } from "@/lib/utils";

type AuthTabsProps = {
  value: AuthTabMode;
  onChange: (value: AuthTabMode) => void;
};

export function AuthTabs({ value, onChange }: AuthTabsProps) {
  return (
    <div className="grid h-11 grid-cols-2 rounded-[14px] bg-[#f3f3f3] p-1 sm:h-12">
      {AUTH_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative h-9 rounded-[10px] text-[13px] font-semibold transition-colors sm:h-10",
            value === tab.id
              ? "bg-white text-primary shadow-tab"
              : "text-[#777777] hover:text-[#1f1f1f]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
