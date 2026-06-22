"use client";

import { useState } from "react";
import { ExternalLink, FilePlus2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseAttachment } from "@/types/expense";

type ExpenseAttachmentsProps = {
  attachments: ExpenseAttachment[];
  fileName: string;
  fileUrl: string;
  mimeType: string;
  onFileNameChange: (value: string) => void;
  onFileUrlChange: (value: string) => void;
  onMimeTypeChange: (value: string) => void;
  onAdd: () => void;
  isAdding: boolean;
};

export function ExpenseAttachments({
  attachments,
  fileName,
  fileUrl,
  mimeType,
  onFileNameChange,
  onFileUrlChange,
  onMimeTypeChange,
  onAdd,
  isAdding,
}: ExpenseAttachmentsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold">Receipts & Invoices</h3>
        </div>
        <Button variant="outline" onClick={() => setIsFormOpen((v) => !v)} className="h-9 gap-2 px-3">
          <FilePlus2 className="h-4 w-4" />
          Add
        </Button>
      </div>

      {isFormOpen && (
        <div className="mb-4 space-y-3 rounded-lg bg-[#f8fafc] p-3">
          <input
            value={fileName}
            onChange={(event) => onFileNameChange(event.target.value)}
            placeholder="Receipt or invoice name"
            className="h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-primary"
          />
          <input
            value={fileUrl}
            onChange={(event) => onFileUrlChange(event.target.value)}
            placeholder="https://..."
            className="h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-primary"
          />
          <input
            value={mimeType}
            onChange={(event) => onMimeTypeChange(event.target.value)}
            placeholder="application/pdf"
            className="h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-primary"
          />
          <Button onClick={onAdd} disabled={isAdding || !fileName.trim() || !fileUrl.trim()} className="w-full">
            {isAdding ? "Adding..." : "Add Attachment"}
          </Button>
        </div>
      )}

      <div className="divide-y divide-[#edf0f3]">
        {attachments.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{attachment.fileName}</p>
              <p className="mt-1 text-xs text-[#6b7280]">
                {attachment.uploaderName} / {new Date(attachment.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-[#9ca3af]" />
          </a>
        ))}
        {attachments.length === 0 && (
          <p className="py-6 text-center text-sm text-[#9ca3af]">No receipts or invoices attached.</p>
        )}
      </div>
    </section>
  );
}
