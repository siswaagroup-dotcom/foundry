import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialAccount } from "./types/create-post-types";

type AccountCardProps = {
  account: SocialAccount;
  selected: boolean;
  onToggle: (id: string) => void;
};

const icons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, twitter: Twitter, youtube: Youtube };

export function AccountCard({ account, selected, onToggle }: AccountCardProps) {
  const Icon = icons[account.icon as keyof typeof icons] ?? Twitter;

  return (
    <button
      type="button"
      onClick={() => onToggle(account.id)}
      className={cn(
        "relative flex min-h-[66px] items-center gap-3 rounded-lg border bg-white p-3 text-left transition-colors",
        selected ? "border-primary bg-orange-50" : "border-[#e5e7eb]",
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{account.name}</span>
        <span className="mt-1 block text-xs text-[#6b7280]">{account.handle}</span>
      </span>
      <span
        className={cn(
          "absolute right-3 top-3 h-4 w-4 rounded border",
          selected ? "border-primary bg-primary" : "border-[#cbd5e1] bg-white",
        )}
      />
    </button>
  );
}
