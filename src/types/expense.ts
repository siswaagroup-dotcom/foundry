export type ExpenseStatus = "Planned" | "Incurred" | "Approved" | "Pending";

export type Expense = {
  id: string;
  name: string;
  detail: string;
  category: string;
  date: string;
  status: ExpenseStatus;
  planned: number;
  incurred: number | null;
};

export type ExpenseFilters = {
  status: string;
  category: string;
  dateRange: string;
  amountRange: string;
};
