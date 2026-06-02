import { cn } from "@/lib/utils";

import type { SocialAccount } from "./types/social-types";

type AccountCardProps = {
  account: SocialAccount;
};

export function AccountCard({
  account,
}: AccountCardProps) {
  return (
    <article className="flex min-h-[82px] items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 shadow-[0_1px_1px_rgba(15,23,42,0.02)]">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base font-bold text-white",
          account.accent
        )}
      >
        F
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-[12px] font-bold text-[#020617]">
          {account.name}
        </h3>
        <p className="mt-1 truncate text-[10px] text-[#526173]">
          {account.handle}
        </p>
        <p className="mt-3 text-[10px] font-medium text-[#020617]">
          <span className="font-bold">
            {account.posts}
          </span>{" "}
          posts
          <span className="ml-3">
            {account.followers}
          </span>
        </p>
      </div>
    </article>
  );
}
