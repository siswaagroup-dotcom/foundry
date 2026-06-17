"use client";

import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentEntry {
  id: string;
  user: string;
  body?: string;
  action: string;
  timestamp: string;
  type: string;
  authorId?: string;
}

type CommentSectionProps = {
  activityLogs: CommentEntry[];
  commentDraft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onDelete: (id: string) => void;
  isSubmitting: boolean;
};

export function CommentSection({
  activityLogs,
  commentDraft,
  onDraftChange,
  onSubmit,
  onDelete,
  isSubmitting,
}: CommentSectionProps) {
  const comments = activityLogs.filter((l) => l.type === "comment" && l.body);

  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Comments</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {comments.length}
        </span>
      </div>

      {/* Comment list */}
      <div className="mb-4 space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-[#9ca3af]">No comments yet. Be the first.</p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex gap-3 rounded-lg bg-[#f8fafc] p-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-primary">
              {c.user.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">{c.user}</p>
                <span className="text-[10px] text-[#9ca3af]">{c.timestamp}</span>
              </div>
              <p className="mt-1 text-sm text-[#374151]">{c.body}</p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(c.id)}
              className="shrink-0 text-[#9ca3af] hover:text-red-500"
              aria-label="Delete comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add comment */}
      <div className="flex gap-3">
        <textarea
          value={commentDraft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
          }}
          placeholder="Write a comment… (Ctrl+Enter to submit)"
          rows={2}
          disabled={isSubmitting}
          className="flex-1 resize-none rounded-[10px] border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        />
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !commentDraft.trim()}
          className="h-10 self-end px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
