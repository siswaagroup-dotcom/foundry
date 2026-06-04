import type {
  BreadcrumbItem,
  SocialPostDetail,
} from "../types/social-post-detail-types";

export const postDetail: SocialPostDetail = {
  id: "post-instagram-product-launch",
  title: "Instagram Post",
  platform: "Instagram",
  account: "@foundry_design",
  caption:
    "🚀 Exciting news! We're thrilled to announce the launch of our new product line designed to revolutionize your workflow. Stay tuned for more updates! #Foundry #Innovation #ProductLaunch #2026Goals",
  image: "Product Launch Visual",
  status: "Scheduled",
  scheduledDate: "March 15, 2026",
};

export const breadcrumbs: BreadcrumbItem[] = [
  { id: "social", label: "Social" },
  { id: "detail", label: "Post Detail" },
];
