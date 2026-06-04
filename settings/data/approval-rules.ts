import type { ApprovalRule } from "../types/settings-types";

export const approvalRules: ApprovalRule[] = [
  {
    id: "expenseApproval",
    title: "Expense Approval",
    value: "Required above $500",
    description: "Expense requests over the threshold require manager review.",
  },
  {
    id: "clientApproval",
    title: "Client Approval",
    value: "Admin approval required",
    description: "New client records require approval before activation.",
  },
  {
    id: "contentApproval",
    title: "Content Approval",
    value: "Required before publishing",
    description: "Social posts and public updates require final review.",
  },
  {
    id: "roleApproval",
    title: "Role Changes",
    value: "Owner approval required",
    description: "Permission changes require workspace owner approval.",
  },
];
