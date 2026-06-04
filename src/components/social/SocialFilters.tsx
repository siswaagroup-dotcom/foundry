import {
  CheckCircle,
  ChevronsLeftRight,
  SlidersHorizontal,
} from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { SocialFilterOption } from "./types/social-types";

type SocialFiltersProps = {
  platforms: SocialFilterOption[];
  accounts: SocialFilterOption[];
  campaigns: SocialFilterOption[];
  platform: string;
  account: string;
  campaign: string;
  accountBadge: number;
  onPlatformChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
};

const FilterSelect = memo(function FilterSelect({
  icon,
  value,
  options,
  badge,
  onChange,
}: {
  icon: React.ReactNode;
  value: string;
  options: SocialFilterOption[];
  badge?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex h-[34px] items-center rounded-md border border-[#E5E7EB] bg-white pl-8 pr-3 text-[12px] font-medium text-[#111827]",
        value !== "all" && "border-[#f15a24]"
      )}
    >
      <span className="absolute left-3 text-[#526173]">
        {icon}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full appearance-none bg-transparent pr-1 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {badge ? (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f15a24] px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </label>
  );
});

export const SocialFilters = memo(function SocialFilters(props: SocialFiltersProps) {
  return (
    <section className="flex flex-wrap gap-3">
      <FilterSelect
        icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
        value={props.platform}
        options={props.platforms}
        onChange={props.onPlatformChange}
      />
      <FilterSelect
        icon={<CheckCircle className="h-3.5 w-3.5" />}
        value={props.account}
        options={props.accounts}
        badge={
          props.account === "all"
            ? props.accountBadge
            : undefined
        }
        onChange={props.onAccountChange}
      />
      <FilterSelect
        icon={<ChevronsLeftRight className="h-3.5 w-3.5" />}
        value={props.campaign}
        options={props.campaigns}
        onChange={props.onCampaignChange}
      />
    </section>
  );
});
