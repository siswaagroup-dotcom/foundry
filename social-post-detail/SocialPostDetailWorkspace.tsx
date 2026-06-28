"use client";

import { ActivityLog } from "./ActivityLog";
import { Breadcrumbs } from "./Breadcrumbs";
import { PostHeader } from "./PostHeader";
import { PostPreview } from "./PostPreview";
import { RelatedSection } from "./RelatedSection";
import { useSocialPostDetail } from "./hooks/useSocialPostDetail";

export function SocialPostDetailWorkspace() {
  const {
    breadcrumbs,
    post,
    caption,
    activityLog,
    relatedItems,
    setCaption,
    backToSocial,
    editPost,
    moreActions,
    publishNow,
    openRelatedItem,
    publishTargets,
    isLoading,
    isPublishing,
    error,
  } = useSocialPostDetail();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm font-medium text-[#6b7280]">
        Loading social post...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-xl border border-red-200 bg-white p-6 text-sm font-medium text-red-700">
        Unable to load this social post.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Breadcrumbs items={breadcrumbs} />
      <PostHeader
        post={post}
        onBack={backToSocial}
        onEdit={editPost}
        onMore={moreActions}
        onPublish={publishNow}
        isPublishing={isPublishing}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PostPreview
          post={post}
          caption={caption}
          onCaptionChange={setCaption}
        />

        <aside className="space-y-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold">Publishing</h3>
            <div className="mt-4 space-y-3">
              {publishTargets.length ? publishTargets.map((target) => (
                <article key={target.id} className="rounded-lg border border-[#edf0f3] p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#111827]">{target.platform}</p>
                      <p className="mt-1 text-xs text-[#64748b]">{target.accountName}</p>
                    </div>
                    <span className="rounded bg-[#eef2ff] px-2 py-1 text-xs font-bold text-[#3730a3]">
                      {target.status}
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#64748b]">Platform Post ID</dt>
                      <dd className="max-w-[180px] truncate font-semibold text-[#111827]">{target.platformPostId ?? "---"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#64748b]">Last Attempt</dt>
                      <dd className="font-semibold text-[#111827]">{target.publishedAt ? new Date(target.publishedAt).toLocaleString() : "---"}</dd>
                    </div>
                    {target.errorMessage ? (
                      <div>
                        <dt className="text-[#64748b]">Error Message</dt>
                        <dd className="mt-1 text-[#b91c1c]">{target.errorMessage}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {target.liveUrl ? (
                    <a
                      href={target.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-bold text-primary"
                    >
                      Open on Platform
                    </a>
                  ) : null}
                </article>
              )) : (
                <p className="text-sm text-[#64748b]">No publishing targets selected.</p>
              )}
            </div>
          </section>
          <ActivityLog activityLog={activityLog} />
          <RelatedSection
            relatedItems={relatedItems}
            onItemClick={openRelatedItem}
          />
        </aside>
      </div>
    </div>
  );
}
