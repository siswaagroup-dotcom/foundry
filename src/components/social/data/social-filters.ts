import type { SocialFilterOption } from "../types/social-types";

export const platformFilters: SocialFilterOption[] = [
  { label: "All Platforms", value: "all" },
  { label: "Facebook", value: "Facebook" },
  { label: "Instagram", value: "Instagram" },
  { label: "LinkedIn", value: "LinkedIn" },
  { label: "X/Twitter", value: "X/Twitter" },
];

export const campaignFilters: SocialFilterOption[] = [
  { label: "All Campaigns", value: "all" },
  { label: "Product Launch", value: "Product Launch" },
  { label: "Brand Awareness", value: "Brand Awareness" },
  { label: "Customer Success", value: "Customer Success" },
];
