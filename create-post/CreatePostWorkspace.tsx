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
          <AccountSelector
            accounts={post.accounts}
            selectedAccounts={post.selectedAccounts}
            onToggle={post.toggleAccount}
          />
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
            <Button variant="outline" onClick={post.saveDraft}>Save Draft</Button>
            <Button onClick={post.schedulePost}>Schedule Post</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
