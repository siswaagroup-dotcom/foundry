import type { CreateExpenseForm, StatusOption } from "../types/expense-types";

export const statusOptions: StatusOption[] = [
  {
    label: "Planned",
    value: "Planned",
    description: "Planned expense expected in the future.",
  },
  {
    label: "Incurred",
    value: "Incurred",
    description: "Incurred: expense already paid or owed.",
  },
];

export const defaultExpenseForm: CreateExpenseForm = {
  status: "Planned",
  currency: "USD",
  amount: "0.00",
  date: "15-01-2026",
  vendor: "",
  category: "",
};
