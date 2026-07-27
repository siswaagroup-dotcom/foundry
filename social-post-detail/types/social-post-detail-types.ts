export interface SocialPostDetail {
  id: string;
  title: string;
  platform: string;
  account: string;
  caption: string;
  image: string;
  status: string;
  scheduledDate: string;
}

export interface ActivityLogItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: string;
}

export interface RelatedItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
}
