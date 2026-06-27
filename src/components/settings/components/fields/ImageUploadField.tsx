"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED  = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

type ImageUploadFieldProps = {
  id: string;
  value: string;   // current URL (empty string if none)
  onChange: (value: string) => void;
};

export function ImageUploadField({ id, value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function processFile(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Only PNG, JPG, JPEG, SVG and WEBP files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File size must be under 2 MB.");
      return;
    }

    // Create object URL for preview only.
    // The real backend upload will replace this URL when the settings API
    // supports multipart/form-data. For now the URL is stored as a data URL.
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer.files[0];
      if (file) processFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange]
  );

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
    // reset input so same file can be re-selected
    event.target.value = "";
  }

  return (
    <div className="mt-2 space-y-3">
      {/* Preview */}
      {value ? (
        <div className="relative inline-flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Workspace logo"
            className="h-16 w-16 rounded-xl border border-[#e5e7eb] object-contain p-1"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      {/* Drop zone */}
      <div
        id={id}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragOver
            ? "border-primary bg-orange-50"
            : "border-[#e5e7eb] bg-[#f8fafc] hover:border-primary/50 hover:bg-orange-50/40"
        )}
      >
        {dragOver ? (
          <Upload className="h-6 w-6 text-primary" />
        ) : (
          <ImageIcon className="h-6 w-6 text-[#9ca3af]" />
        )}
        <span className="text-xs text-[#6b7280]">
          <span className="font-semibold text-primary">Click to upload</span>
          {" "}or drag & drop
        </span>
        <span className="text-[10px] text-[#9ca3af]">PNG, JPG, SVG, WEBP · max 2 MB</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={handleFileInput}
        className="sr-only"
        aria-hidden="true"
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
