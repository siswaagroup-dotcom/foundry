// =============================================================================
// EXPENSE TYPES — shared between client and server
// Must NOT import server-only modules.
// =============================================================================

export type ExpenseStatus =
  | "planned"
  | "pending"
  | "approved"
  | "incurred"
  | "rejected"
  | "paid";

export type ApprovalStage =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "paid";

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
  notes:          string | null;
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
  attachments:    ExpenseAttachment[];
  createdBy:      string;
  createdAt:      string;
  updatedAt:      string;
}

export interface ExpenseAttachment {
  id:             string;
  expenseId:      string;
  fileName:       string;
  fileUrl:        string;
  fileSizeBytes:  number | null;
  mimeType:       string | null;
  uploaderId:     string;
  uploaderName:   string;
  uploadedAt:     string;
}

export interface CreateExpenseAttachmentInput {
  fileName:       string;
  fileUrl:        string;
  fileSizeBytes?: number | null;
  mimeType?:      string | null;
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
  notes?:         string;
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
  notes?:         string | null;
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
