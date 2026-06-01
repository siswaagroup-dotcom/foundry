import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExpensesHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Expenses
        </h1>
      </div>
      <Button className="h-10 gap-2 rounded-lg px-4 shadow-[0_10px_24px_rgba(249,115,22,0.24)] sm:w-auto">
        <Plus className="h-4 w-4" />
        New Expense
      </Button>
    </header>
  );
}
