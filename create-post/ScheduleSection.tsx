import { CalendarDays } from "lucide-react";

type ScheduleSectionProps = {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

export function ScheduleSection({
  date,
  time,
  onDateChange,
  onTimeChange,
}: ScheduleSectionProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-6 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold">Scheduling</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[#374151]">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-2 h-11 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#374151]">Time</span>
          <input
            type="time"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="mt-2 h-11 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </label>
      </div>
    </section>
  );
}
