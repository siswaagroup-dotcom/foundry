import { Pencil } from "lucide-react";
import type { CreatePostConfig } from "./types/create-post-types";

type PostContentProps = {
  content: string;
  config: CreatePostConfig;
  onChange: (value: string) => void;
};

export function PostContent({ content, config, onChange }: PostContentProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-6 flex items-center gap-2">
        <Pencil className="h-4 w-4 fill-primary text-primary" />
        <h2 className="text-sm font-bold">Post Content</h2>
      </div>
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
        Content <span className="text-primary">*</span>
      </label>
      <div className="relative">
        <textarea
          value={content}
          onChange={(event) => onChange(event.target.value)}
          placeholder={config.contentPlaceholder}
          className="min-h-[150px] w-full resize-y rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-4 pr-14 text-sm outline-none placeholder:text-[#6b7280] focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <span className="absolute bottom-4 right-11 text-xs text-[#9ca3af]">
          {content.length} / {config.maxLength}
        </span>
      </div>
    </section>
  );
}
