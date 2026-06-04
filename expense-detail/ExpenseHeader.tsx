import { Edit3, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseDetail } from "./types/expense-detail-types";

type ExpenseHeaderProps = {
  expense: ExpenseDetail;
  onEdit: () => void;
  onMore: () => void;
};

export function ExpenseHeader({
  expense,
  onEdit,
  onMore,
}: ExpenseHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e5e7eb] pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">{expense.title}</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          {expense.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onEdit} className="h-12">
          <Edit3 className="h-4 w-4" />
          Edit Expense
        </Button>
        <button
          type="button"
          onClick={onMore}
          className="inline-flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
