import { BarChart3, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ExpensesHeaderProps = {
  onCreateExpense?: () => void;
};

export function ExpensesHeader({ onCreateExpense }: ExpensesHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Expenses
        </h1>
        <div className="mt-2 flex gap-3">
          <Link
            href="/dashboard/expenses/approvals"
            className="flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-primary"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approvals
          </Link>
          <Link
            href="/dashboard/expenses/analytics"
            className="flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-primary"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </Link>
        </div>
      </div>
      <Button
        onClick={onCreateExpense}
        className="h-10 gap-2 rounded-lg px-4 shadow-[0_10px_24px_rgba(249,115,22,0.24)] sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        New Expense
      </Button>
    </header>
  );
}
