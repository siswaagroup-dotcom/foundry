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
    openRelatedItem,
  } = useSocialPostDetail();

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Breadcrumbs items={breadcrumbs} />
      <PostHeader
        post={post}
        onBack={backToSocial}
        onEdit={editPost}
        onMore={moreActions}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PostPreview
          post={post}
          caption={caption}
          onCaptionChange={setCaption}
        />

        <aside className="space-y-5">
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
