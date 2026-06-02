import type { SocialPost } from "./types/social-types";

type SocialListViewProps = {
  posts: SocialPost[];
};

export function SocialListView({
  posts,
}: SocialListViewProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="hidden h-10 grid-cols-[1fr_120px_130px_120px] items-center gap-4 bg-[#fafafa] px-5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#5f6b7a] md:grid">
        <span>Post</span>
        <span>Date</span>
        <span>Platform</span>
        <span>Status</span>
      </div>

      <div>
        {posts.map((post) => (
          <article
            key={post.id}
            className="grid gap-2 border-t border-[#EEF0F3] bg-white px-5 py-4 text-[12px] md:grid-cols-[1fr_120px_130px_120px] md:items-center md:gap-4"
          >
            <div>
              <p className="font-bold text-[#020617]">
                {post.title}
              </p>
              <p className="mt-1 text-[10px] text-[#526173]">
                {post.campaign}
              </p>
            </div>
            <p className="font-medium text-[#0f172a]">
              {post.date}
            </p>
            <p className="font-medium text-[#0f172a]">
              {post.platform}
            </p>
            <span className="w-fit rounded bg-[#e3e8ff] px-2 py-1 text-[10px] font-medium text-[#064cc9]">
              {post.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
