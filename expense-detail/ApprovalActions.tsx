"use client";

import { CheckCircle, CreditCard, MessageSquare, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApprovalStage } from "@/types/expense";

type ApprovalActionsProps = {
  comment:         string;
  onCommentChange: (v: string) => void;
  onSubmit:        (stage: ApprovalStage) => void;
  isLoading:       boolean;
};

export function ApprovalActions({
  comment, onCommentChange, onSubmit, isLoading,
}: ApprovalActionsProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Approval Actions</h3>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-[#374151]">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add a comment or reason..."
          rows={2}
          disabled={isLoading}
          className="w-full resize-none rounded-[10px] border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onSubmit("approved")}
          disabled={isLoading}
          className="h-10 gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>

        <Button
          variant="outline"
          onClick={() => onSubmit("under_review")}
          disabled={isLoading}
          className="h-10 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Mark Under Review
        </Button>

        <Button
          variant="outline"
          onClick={() => onSubmit("changes_requested")}
          disabled={isLoading}
          className="h-10 gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <MessageSquare className="h-4 w-4" />
          Request Changes
        </Button>

        <Button
          variant="outline"
          onClick={() => onSubmit("rejected")}
          disabled={isLoading}
          className="h-10 gap-2 border-red-300 text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>

        <Button
          variant="outline"
          onClick={() => onSubmit("paid")}
          disabled={isLoading}
          className="h-10 gap-2 border-sky-300 text-sky-700 hover:bg-sky-50"
        >
          <CreditCard className="h-4 w-4" />
          Mark Paid
        </Button>
      </div>
    </section>
  );
}
