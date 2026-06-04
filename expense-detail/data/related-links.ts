import type { RelatedLink } from "../types/expense-detail-types";

export const relatedLinks: RelatedLink[] = [
  {
    id: "client-acme",
    title: "View Client: Acme Corporation",
    href: "/dashboard/clients/acme-corporation",
  },
  {
    id: "expenses",
    title: "Back to Expenses",
    href: "/dashboard/expenses",
  },
];
