import { Image, Instagram } from "lucide-react";
import type { SocialPostDetail } from "./types/social-post-detail-types";

type PostPreviewProps = {
  post: SocialPostDetail;
  caption: string;
  onCaptionChange: (value: string) => void;
};

export function PostPreview({
  post,
  caption,
  onCaptionChange,
}: PostPreviewProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <h3 className="text-base font-bold">Post Preview</h3>
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#f8fafc] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{post.platform}</p>
            <p className="mt-1 text-xs text-[#6b7280]">{post.account}</p>
          </div>
        </div>

        <div className="rounded-lg border border-[#edf0f3] p-4">
          <textarea
            value={caption}
            onChange={(event) => onCaptionChange(event.target.value)}
            className="min-h-[86px] w-full resize-none border-0 bg-white p-0 text-sm leading-6 outline-none"
            aria-label="Post caption"
          />
          <div className="mt-4 flex aspect-[16/9] min-h-[240px] items-center justify-center rounded-lg bg-[#e5e7eb] text-[#9ca3af]">
            <div className="text-center">
              <Image className="mx-auto h-8 w-8 text-[#c7cdd5]" />
              <p className="mt-3 text-xs">{post.image}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
