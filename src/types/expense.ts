// =============================================================================
// EXPENSE TYPES — shared between client and server
// Must NOT import server-only modules.
// =============================================================================

export type ExpenseStatus =
  | "planned"
  | "pending"
  | "approved"
  | "incurred"
  | "rejected";

export type ApprovalStage =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "changes_requested";

export interface ExpenseApproval {
  id:           string;
  expenseId:    string;
  approverId:   string;
  approverName: string;
  approverInitials: string;
  stage:        ApprovalStage;
  comment:      string | null;
  actionedAt:   string;
}

export interface Expense {
  id:             string;
  workspaceId:    string;
  name:           string;
  detail:         string | null;
  category:       string;
  vendor:         string | null;
  currency:       string;
  amountPlanned:  number;
  amountIncurred: number | null;
  status:         ExpenseStatus;
  expenseDate:    string;
  ownerId:        string;
  ownerName:      string;
  ownerInitials:  string;
  clientId:       string | null;
  approvals:      ExpenseApproval[];
  createdBy:      string;
  createdAt:      string;
  updatedAt:      string;
}

export interface ExpenseFilters {
  status?:      ExpenseStatus | "all";
  category?:    string;
  search?:      string;
  ownerId?:     string;
  dateFrom?:    string;
  dateTo?:      string;
  amountMin?:   number;
  amountMax?:   number;
}

export interface CreateExpenseInput {
  name:           string;
  detail?:        string;
  category:       string;
  vendor?:        string;
  currency?:      string;
  amountPlanned:  number;
  amountIncurred?: number;
  status?:        ExpenseStatus;
  expenseDate:    string;
  clientId?:      string;
}

export interface UpdateExpenseInput {
  name?:          string;
  detail?:        string | null;
  category?:      string;
  vendor?:        string | null;
  currency?:      string;
  amountPlanned?: number;
  amountIncurred?: number | null;
  status?:        ExpenseStatus;
  expenseDate?:   string;
  clientId?:      string | null;
}

export interface ApproveExpenseInput {
  stage:    ApprovalStage;
  comment?: string;
}

// ─── Legacy compatibility (list page still uses old shape) ───────────────────
// Will be removed once expense list is updated to use new Expense type.
export type { Expense as ExpenseLegacy };
