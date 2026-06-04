import { memo } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  Client,
  ClientTag,
} from "./types/client-types";

const tagClass: Record<ClientTag, string> = {
  Enterprise: "bg-[#e8f0ff] text-[#3478f6]",
  Premium: "bg-[#fff3c7] text-[#f59e0b]",
  Verified: "bg-[#eef2ff] text-[#3478f6]",
  Standard: "bg-[#eef2ff] text-[#3478f6]",
};

const dotClass = {
  green: "bg-[#9ad8bd]",
  yellow: "bg-[#f4cf7b]",
  gray: "bg-[#c7cdd6]",
};

export const ClientRow = memo(function ClientRow({
  client,
  onSelect,
}: {
  client: Client;
  onSelect?: (client: Client) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(client)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSelect?.(client);
      }}
      className="grid min-h-[72px] cursor-pointer grid-cols-1 gap-3 border-t border-[#EEF0F3] bg-white px-5 py-4 transition hover:bg-[#fafafa] md:grid-cols-[1.25fr_0.8fr_0.65fr_0.85fr_24px] md:items-center md:gap-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[linear-gradient(135deg,#df672d,#4fb6d4)] text-[15px] font-bold text-white">
          {client.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold text-[#020617]">
            {client.name}
          </p>
          <p className="mt-1 truncate text-[10px] text-[#526173]">
            {client.industry}
          </p>
        </div>
      </div>

      <p className="text-[12px] font-medium text-[#0f172a]">
        {client.contact}
      </p>

      <div className="flex items-center gap-1.5 text-[11px] text-[#526173]">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotClass[client.activityTone]
          )}
        />
        {client.activity}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {client.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-medium",
              tagClass[tag]
            )}
          >
            {tag}
          </span>
        ))}
      </div>

      <ArrowUpRight className="hidden h-4 w-4 text-[#64748b] md:block" />
    </article>
  );
});
