// Legacy static data — used only by dashboard overview page (lib/dashboard-data.ts)
// Expense module now reads from PostgreSQL via /api/expenses
// This file kept for backward compatibility with dashboard stats only.

export const savedExpenseFilters = [
  "Over Budget Expenses",
  "Pending Approvals",
  "Marketing Only",
  "This Quarter",
  "High Value ($10k+)",
];

export const expenseFilterOptions = {
  status:      ["All Expenses", "Planned", "Incurred", "Approved", "Pending", "Rejected"],
  category:    ["All Categories", "Marketing", "Office", "Software", "Travel", "Operations"],
  dateRange:   ["This Month", "This Quarter", "This Year", "Custom Range"],
  amountRange: ["All Amounts", "Under $5k", "$5k - $10k", "$10k+"],
};
