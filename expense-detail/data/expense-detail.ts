import type {
  BreadcrumbItem,
  ExpenseDetail,
} from "../types/expense-detail-types";

export const expenseDetail: ExpenseDetail = {
  id: "exp-office-supplies-q1",
  title: "Office Supplies - Q1 2026",
  amount: 1247.89,
  currency: "USD",
  vendor: "Office Depot Inc.",
  date: "Jan 15, 2026",
  category: "Office Supplies",
  paymentMethod: "Corporate Card",
  relatedClient: "Acme Corporation",
  status: "Approved",
};

export const breadcrumbs: BreadcrumbItem[] = [
  { id: "expenses", label: "Expenses" },
  { id: "detail", label: "Expense Detail" },
];
