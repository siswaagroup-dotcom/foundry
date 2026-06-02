"use client";

import { useMemo, useState } from "react";

import { socialAccounts } from "../data/social-accounts";
import { campaignFilters, platformFilters } from "../data/social-filters";
import { socialPosts } from "../data/social-posts";
import type { CalendarDayData, SocialView } from "../types/social-types";
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
  posts: typeof socialPosts
): CalendarDayData[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(year, monthIndex, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toDateKey(date);

    return {
      key, date, day: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
      posts: posts.filter((post) => post.date === key),
    };
  });
}
export function useSocial() {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(2026, 0, 1)
  );
  const [selectedView, setSelectedView] = useState<SocialView>("calendar");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState("2026-01-15");

  const accountFilters = useMemo(
    () => [
      { label: "All Accounts", value: "all" },
      ...socialAccounts.map((account) => ({
        label: account.name, value: account.id,
      })),
    ],
    []
  );

  const filteredPosts = useMemo(() => {
    return socialPosts.filter((post) => {
      return (
        (platformFilter === "all" || post.platform === platformFilter) &&
        (accountFilter === "all" || post.account === accountFilter) &&
        (campaignFilter === "all" || post.campaign === campaignFilter)
      );
    });
  }, [accountFilter, campaignFilter, platformFilter]);
  const calendarDays = useMemo(
    () => buildCalendar(currentMonth, filteredPosts),
    [currentMonth, filteredPosts]
  );
  return {
    monthTitle: currentMonth.toLocaleString("en-US", {
      month: "long", year: "numeric",
    }),
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
    accounts: socialAccounts,
    platformFilters,
    accountFilters,
    campaignFilters,
    nextMonth: () => setCurrentMonth(addMonths(currentMonth, 1)),
    previousMonth: () => setCurrentMonth(addMonths(currentMonth, -1)),
  };
}
