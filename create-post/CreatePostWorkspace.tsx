"use client";

import { Button } from "@/components/ui/button";
import { AccountSelector } from "./AccountSelector";
import { CreatePostHeader } from "./CreatePostHeader";
import { MediaUpload } from "./MediaUpload";
import { PostContent } from "./PostContent";
import { PostSettings } from "./PostSettings";
import { ScheduleSection } from "./ScheduleSection";
import { useCreatePost } from "./hooks/useCreatePost";

export function CreatePostWorkspace() {
  const post = useCreatePost();

  return (
    <div className="min-h-full bg-white">
      <CreatePostHeader />
      <main className="border-t border-[#f1f5f9] bg-[#f8fafc] px-4 py-8">
        <div className="mx-auto max-w-[880px] space-y-6">
          {post.isLoading ? (
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 text-sm font-medium text-[#6b7280]">
              Loading connected accounts...
            </div>
          ) : post.error ? (
            <div className="rounded-xl border border-red-200 bg-white p-5 text-sm font-medium text-red-700">
              Unable to load social accounts.
            </div>
          ) : post.accounts.length === 0 ? (
            <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-center">
              <h2 className="text-lg font-bold text-[#111827]">No connected accounts</h2>
              <p className="mt-2 text-sm text-[#64748b]">
                Connect a social account before publishing.
              </p>
              <Button className="mt-5" onClick={post.connectAccounts}>Connect Account</Button>
            </section>
          ) : (
            <AccountSelector
              accounts={post.accounts}
              selectedAccounts={post.selectedAccounts}
              onToggle={post.toggleAccount}
            />
          )}
          <PostContent
            content={post.content}
            config={post.config}
            onChange={post.updateContent}
          />
          <MediaUpload
            config={post.config}
            media={post.media}
            onUpload={post.addMedia}
          />
          <ScheduleSection
            date={post.date}
            time={post.time}
            onDateChange={post.setDate}
            onTimeChange={post.setTime}
          />
          <PostSettings
            settingsConfig={post.settingsConfig}
            settings={post.settings}
            onToggle={post.toggleSetting}
          />
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={post.cancel}>Cancel</Button>
            <Button variant="outline" onClick={post.saveDraft} disabled={post.isSubmitting}>Save Draft</Button>
            <Button onClick={post.schedulePost} disabled={post.isSubmitting}>Schedule Post</Button>
            <Button onClick={post.publishNow} disabled={post.isSubmitting}>Publish</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
