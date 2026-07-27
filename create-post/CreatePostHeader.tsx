import Link from "next/link";
import { LayoutPanelTop } from "lucide-react";

export function CreatePostHeader() {
  return (
    <header className="border-b border-[#e5e7eb] px-7 py-6">
      <nav className="mb-5 flex items-center gap-2 text-xs text-[#6b7280]">
        <Link href="/dashboard/social" className="text-primary hover:underline transition-colors">
          Posts
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111827]">Create Post</span>
      </nav>

      <div className="flex items-center gap-3">
        <LayoutPanelTop className="h-5 w-5 text-primary" />
        <h1 className="text-[24px] font-bold leading-none text-[#1f2933]">
          Create New Post
        </h1>
      </div>
    </header>
  );
}
