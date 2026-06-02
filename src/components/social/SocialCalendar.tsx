import { ChevronLeft, ChevronRight } from "lucide-react";

import { CalendarDay } from "./CalendarDay";
import type { CalendarDayData } from "./types/social-types";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SocialCalendarProps = {
  monthTitle: string;
  days: CalendarDayData[];
  selectedDay: string;
  onSelectDay: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export function SocialCalendar({
  monthTitle,
  days,
  selectedDay,
  onSelectDay,
  onPreviousMonth,
  onNextMonth,
}: SocialCalendarProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex h-[58px] items-center justify-between px-5">
        <h2 className="text-[15px] font-bold text-[#020617]">
          {monthTitle}
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#526173]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#526173]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-[#E5E7EB]">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-11 border-r border-[#E5E7EB] pt-4 text-center text-[10px] font-bold uppercase text-[#5f6b7a] last:border-r-0"
          >
            {day}
          </div>
        ))}
        {days.map((day) => (
          <CalendarDay
            key={day.key}
            day={day}
            selectedDay={selectedDay}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </section>
  );
}
