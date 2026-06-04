export interface ExpenseDetail {
  id: string;
  title: string;
  amount: number;
  currency: string;
  vendor: string;
  date: string;
  category: string;
  paymentMethod: string;
  relatedClient: string;
  status: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  approver: string;
  timestamp: string;
  status: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  timestamp: string;
  type: string;
}

export interface RelatedLink {
  id: string;
  title: string;
  href: string;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
}
