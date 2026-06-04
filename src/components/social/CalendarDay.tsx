import { memo, useCallback } from "react";

import { cn } from "@/lib/utils";

import type { CalendarDayData } from "./types/social-types";

type CalendarDayProps = {
  day: CalendarDayData;
  selectedDay: string;
  onSelect: (date: string) => void;
};

export const CalendarDay = memo(function CalendarDay({
  day,
  selectedDay,
  onSelect,
}: CalendarDayProps) {
  const selected = day.key === selectedDay;
  const selectDay = useCallback(() => onSelect(day.key), [day.key, onSelect]);

  return (
    <button
      type="button"
      onClick={selectDay}
      className="min-h-[95px] border-r border-t border-[#E5E7EB] bg-white p-2 text-left last:border-r-0"
    >
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-bold text-[#020617]",
          !day.inMonth && "text-[#9ca3af]",
          selected && "bg-[#f15a24] text-white"
        )}
      >
        {day.day}
      </span>

      <div className="mt-3 space-y-1">
        {day.posts.map((post) => (
          <div
            key={post.id}
            className="rounded bg-[#e3e8ff] px-2 py-1 text-[10px] font-medium leading-tight text-[#064cc9] shadow-[inset_2px_0_0_#4aa3ff]"
          >
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full border border-[#064cc9]" />
            {post.title}
          </div>
        ))}
      </div>
    </button>
  );
});
