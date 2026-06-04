export type ExpenseStatus = "Planned" | "Incurred";

export interface SelectOption {
  label: string;
  value: string;
}

export interface StatusOption extends SelectOption {
  description: string;
}

export interface CreateExpenseForm {
  status: ExpenseStatus;
  currency: string;
  amount: string;
  date: string;
  vendor: string;
  category: string;
}

export interface CreateExpenseValidation {
  amount: boolean;
  date: boolean;
  vendor: boolean;
  category: boolean;
}
