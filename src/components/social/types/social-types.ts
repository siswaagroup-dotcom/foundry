export type SocialView = "calendar" | "list";

export interface SocialPost {
  id: string;
  title: string;
  date: string;
  platform: string;
  account: string;
  campaign: string;
  status: string;
}

export interface SocialAccount {
  id: string;
  name: string;
  handle: string;
  posts: number;
  followers: string;
  platform: string;
  accent: string;
  status?: string;
}

export type SocialFilterOption = {
  label: string;
  value: string;
};

export type CalendarDayData = {
  key: string;
  date: Date;
  day: number;
  inMonth: boolean;
  posts: SocialPost[];
};
