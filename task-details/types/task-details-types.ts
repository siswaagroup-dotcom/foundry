export interface TaskDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  urgency: string;
  stage: string;
  assignedTo: string;
  dueDate: string;
}

export interface Reviewer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
}

export interface ActivityLogItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: string;
}

export interface RelatedEntity {
  id: string;
  title: string;
  subtitle: string;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
}

export interface SelectOption {
  label: string;
  value: string;
}
