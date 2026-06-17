"use client";

import { profileConfig } from "./data/profile-config";
import type { ProfileErrors } from "./types/profile-types";

type ProfilePhotoProps = {
  avatarUrl: string;
  fullName: string;
  error?: ProfileErrors["photoFile"];
  onPhotoChange: (file: File | null) => void;
};

export function ProfilePhoto({
  avatarUrl,
  fullName,
  error,
  onPhotoChange,
}: ProfilePhotoProps) {
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3f4f6] text-lg font-semibold text-[#4b5563]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            initials || "U"
          )}
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#fafafa]">
          Profile Photo
          <input
            type="file"
            accept={profileConfig.avatar.acceptAttribute}
            className="sr-only"
            onChange={(event) => onPhotoChange(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      <p className="min-h-4 text-xs leading-4 text-primary">{error}</p>
    </div>
  );
}
