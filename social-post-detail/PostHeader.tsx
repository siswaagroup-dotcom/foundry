import { ArrowLeft, Edit3, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SocialPostDetail } from "./types/social-post-detail-types";

type PostHeaderProps = {
  post: SocialPostDetail;
  onBack: () => void;
  onEdit: () => void;
  onMore: () => void;
};

export function PostHeader({ post, onBack, onEdit, onMore }: PostHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e5e7eb] pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          {post.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onBack} className="h-10">
          <ArrowLeft className="h-4 w-4" />
          Back to Social
        </Button>
        <Button onClick={onEdit} className="h-10">
          <Edit3 className="h-4 w-4" />
          Edit Post
        </Button>
        <button
          type="button"
          onClick={onMore}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f8fafc]"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
