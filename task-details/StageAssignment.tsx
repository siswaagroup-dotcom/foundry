import { BarChart3, Calendar, User } from "lucide-react";
import type { SelectOption } from "./types/task-details-types";

type StageAssignmentProps = {
  stage: string;
  assignee: string;
  dueDate: string;
  stageOptions: SelectOption[];
  assigneeOptions: SelectOption[];
  dueDateOptions: SelectOption[];
  onStageChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
};

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-0 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function StageAssignment(props: StageAssignmentProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Stage & Assignment</h3>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-lg bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-[#6b7280]" />
            Current Stage
          </span>
          <SelectField value={props.stage} options={props.stageOptions} onChange={props.onStageChange} />
        </div>
        <div className="flex flex-col gap-3 rounded-lg bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 text-[#6b7280]" />
            Assigned To
          </span>
          <SelectField value={props.assignee} options={props.assigneeOptions} onChange={props.onAssigneeChange} />
        </div>
        <div className="flex flex-col gap-3 rounded-lg bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-[#6b7280]" />
            Due Date
          </span>
          <SelectField value={props.dueDate} options={props.dueDateOptions} onChange={props.onDueDateChange} />
        </div>
      </div>
    </section>
  );
}
