"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { ConnectedAccounts } from "./ConnectedAccounts";
import { SocialCalendar } from "./SocialCalendar";
import { SocialFilters } from "./SocialFilters";
import { SocialHeader } from "./SocialHeader";
import { SocialListView } from "./SocialListView";
import { useSocial } from "./hooks/useSocial";

export function SocialWorkspace() {
  const router = useRouter();
  const social = useSocial();
  const createPost = useCallback(
    () => router.push("/dashboard/social/create"),
    [router],
  );
  const connectedAccounts = useCallback(
    () => router.push("/dashboard/social/accounts"),
    [router],
  );
  const selectPost = useCallback(
    (postId: string) => router.push(`/dashboard/social/${postId}`),
    [router],
  );

  return (
    <div className="mx-auto min-h-full max-w-[1110px] bg-white">
      <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-6">
        <SocialHeader
          selectedView={social.selectedView}
          onViewChange={social.setSelectedView}
          onCreatePost={createPost}
          onConnectedAccounts={connectedAccounts}
        />

        <SocialFilters
          platforms={social.platformFilters}
          accounts={social.accountFilters}
          campaigns={social.campaignFilters}
          platform={social.platformFilter}
          account={social.accountFilter}
          campaign={social.campaignFilter}
          accountBadge={social.accounts.length}
          onPlatformChange={social.setPlatformFilter}
          onAccountChange={social.setAccountFilter}
          onCampaignChange={social.setCampaignFilter}
        />
      </div>

      <div className="grid border-t border-[#E5E7EB] bg-[#f8fafc] lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="px-4 py-6 sm:px-6 lg:px-6">
          {social.isLoading ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-sm font-medium text-[#526173]">
              Loading social posts...
            </div>
          ) : social.error ? (
            <div className="rounded-xl border border-[#FCA5A5] bg-white p-8 text-sm font-medium text-[#991B1B]">
              Unable to load social posts.
            </div>
          ) : social.selectedView === "calendar" ? (
            <SocialCalendar
              monthTitle={social.monthTitle}
              days={social.calendarDays}
              selectedDay={social.selectedDay}
              onSelectDay={social.setSelectedDay}
              onPreviousMonth={social.previousMonth}
              onNextMonth={social.nextMonth}
            />
          ) : (
            <SocialListView
              posts={social.filteredPosts}
              onSelectPost={selectPost}
            />
          )}
        </div>

        <ConnectedAccounts
          accounts={social.accounts}
        />
      </div>

      <button
        type="button"
        onClick={createPost}
        className="fixed bottom-7 right-7 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#f15a24] text-white shadow-[0_8px_18px_rgba(241,90,36,0.28)]"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
