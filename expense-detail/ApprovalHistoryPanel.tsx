import { History, MessageSquare } from "lucide-react";
import type { ExpenseApproval } from "@/types/expense";

type ApprovalHistoryPanelProps = {
  approvals: ExpenseApproval[];
  rejectionReason: string | null;
};

function label(stage: string) {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ApprovalHistoryPanel({ approvals, rejectionReason }: ApprovalHistoryPanelProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Approval History</h3>
      </div>

      {rejectionReason && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-red-600">Rejection Reason</p>
          <p className="mt-1 text-sm font-semibold text-red-700">{rejectionReason}</p>
        </div>
      )}

      <div className="divide-y divide-[#edf0f3]">
        {approvals.map((approval) => (
          <div key={approval.id} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{label(approval.stage)}</p>
                <p className="mt-1 text-xs text-[#6b7280]">{approval.approverName}</p>
              </div>
              <time className="shrink-0 text-xs text-[#9ca3af]">
                {new Date(approval.actionedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </time>
            </div>
            {approval.comment && (
              <p className="mt-2 flex gap-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-[#374151]">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
                {approval.comment}
              </p>
            )}
          </div>
        ))}
        {approvals.length === 0 && (
          <p className="py-6 text-center text-sm text-[#9ca3af]">No approval history yet.</p>
        )}
      </div>
    </section>
  );
}
