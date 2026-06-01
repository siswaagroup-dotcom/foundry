import type { Expense } from "@/types/expense";

export const expenses: Expense[] = [
  {
    id: "exp-001",
    name: "Google Ads Campaign Q1",
    detail: "Digital Marketing",
    category: "Marketing",
    date: "Jan 15, 2026",
    status: "Incurred",
    planned: 12000,
    incurred: 11450,
  },
  {
    id: "exp-002",
    name: "Office Furniture Upgrade",
    detail: "Office Equipment",
    category: "Office",
    date: "Jan 20, 2026",
    status: "Planned",
    planned: 8500,
    incurred: null,
  },
  {
    id: "exp-003",
    name: "SaaS Licenses - Annual",
    detail: "Software & Tools",
    category: "Software",
    date: "Jan 5, 2026",
    status: "Approved",
    planned: 15000,
    incurred: 15000,
  },
  {
    id: "exp-004",
    name: "Team Conference Travel",
    detail: "Travel & Events",
    category: "Travel",
    date: "Feb 2, 2026",
    status: "Pending",
    planned: 7250,
    incurred: 6890,
  },
  {
    id: "exp-005",
    name: "Client Workshop Materials",
    detail: "Client Success",
    category: "Operations",
    date: "Feb 12, 2026",
    status: "Incurred",
    planned: 5500,
    incurred: 8840,
  },
];

export const savedExpenseFilters = [
  "Over Budget Expenses",
  "Pending Approvals",
  "Marketing Only",
  "This Quarter",
  "High Value ($10k+)",
];

export const expenseFilterOptions = {
  status: ["All Expenses", "Planned", "Incurred", "Approved", "Pending"],
  category: ["All Categories", "Marketing", "Office", "Software", "Travel", "Operations"],
  dateRange: ["This Month", "This Quarter", "This Year", "Custom Range"],
  amountRange: ["All Amounts", "Under $5k", "$5k - $10k", "$10k+"],
};
