"use client";

import { useCallback, useMemo, useState } from "react";

import { useSocialDashboard } from "@/hooks/useSocialManagement";
import type { SocialAccount as ApiSocialAccount, SocialPost as ApiSocialPost } from "@/types/social";

import type { CalendarDayData, SocialView } from "../types/social-types";

const platformFilters = [
  { label: "All Platforms", value: "all" },
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "X", value: "x" },
  { label: "YouTube", value: "youtube" },
];

const platformAccent: Record<string, string> = {
  facebook: "bg-[#1877f2]",
  instagram: "bg-[#e4405f]",
  linkedin: "bg-[#0a66c2]",
  x: "bg-[#111827]",
  youtube: "bg-[#ff0000]",
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
function buildCalendar(
  month: Date,
  posts: ReturnType<typeof mapPost>[]
): CalendarDayData[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(year, monthIndex, 1 - firstDay.getDay());
  const postsByDate = new Map<string, ReturnType<typeof mapPost>[]>();

  posts.forEach((post) => {
    const current = postsByDate.get(post.date);

    if (current) {
      current.push(post);
      return;
    }

    postsByDate.set(post.date, [post]);
  });

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toDateKey(date);

    return {
      key, date, day: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
      posts: postsByDate.get(key) ?? [],
    };
  });
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function mapPost(post: ApiSocialPost) {
  return {
    id: post.id,
    title: post.title || post.caption.slice(0, 72) || "Untitled post",
    date: formatDate(post.scheduledAt || post.publishedAt || post.createdAt),
    platform: post.platform,
    account: post.accounts[0]?.socialAccountId ?? "unassigned",
    campaign: post.campaign || "No campaign",
    status: post.status,
  };
}

function mapAccount(account: ApiSocialAccount) {
  return {
    id: account.id,
    name: account.accountName,
    handle: account.handle,
    posts: account.postsCount ?? 0,
    followers: account.followersCount == null ? "---" : account.followersCount.toLocaleString(),
    platform: account.platform,
    accent: platformAccent[account.platform] ?? "bg-[#64748b]",
    status: account.status,
  };
}

export function useSocial() {
  const dashboard = useSocialDashboard();
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedView, setSelectedView] = useState<SocialView>("calendar");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState(() => toDateKey(new Date()));
  const posts = useMemo(
    () => (dashboard.data?.posts ?? []).map(mapPost),
    [dashboard.data?.posts],
  );
  const accounts = useMemo(
    () => (dashboard.data?.accounts ?? []).map(mapAccount),
    [dashboard.data?.accounts],
  );

  const accountFilters = useMemo(
    () => [
      { label: "All Accounts", value: "all" },
      ...accounts.map((account) => ({
        label: account.name, value: account.id,
      })),
    ],
    [accounts]
  );

  const campaignFilters = useMemo(() => {
    const campaigns = Array.from(new Set(posts.map((post) => post.campaign).filter(Boolean)));
    return [
      { label: "All Campaigns", value: "all" },
      ...campaigns.map((campaign) => ({ label: campaign, value: campaign })),
    ];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      return (
        (platformFilter === "all" || post.platform === platformFilter) &&
        (accountFilter === "all" || post.account === accountFilter) &&
        (campaignFilter === "all" || post.campaign === campaignFilter)
      );
    });
  }, [accountFilter, campaignFilter, platformFilter, posts]);
  const calendarDays = useMemo(
    () => buildCalendar(currentMonth, filteredPosts),
    [currentMonth, filteredPosts]
  );
  const monthTitle = useMemo(
    () =>
      currentMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth],
  );
  const nextMonth = useCallback(() => {
    setCurrentMonth((month) => addMonths(month, 1));
  }, []);
  const previousMonth = useCallback(() => {
    setCurrentMonth((month) => addMonths(month, -1));
  }, []);

  return {
    monthTitle,
    selectedView,
    setSelectedView,
    platformFilter,
    setPlatformFilter,
    accountFilter,
    setAccountFilter,
    campaignFilter,
    setCampaignFilter,
    selectedDay,
    setSelectedDay,
    filteredPosts,
    calendarDays,
    accounts,
    isLoading: dashboard.isLoading,
    error: dashboard.error,
    platformFilters,
    accountFilters,
    campaignFilters,
    nextMonth,
    previousMonth,
  };
}
