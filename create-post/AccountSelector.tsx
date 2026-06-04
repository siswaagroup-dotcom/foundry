import { CheckCircle2 } from "lucide-react";
import { AccountCard } from "./AccountCard";
import type { SocialAccount } from "./types/create-post-types";

type AccountSelectorProps = {
  accounts: SocialAccount[];
  selectedAccounts: string[];
  onToggle: (id: string) => void;
};

export function AccountSelector({
  accounts,
  selectedAccounts,
  onToggle,
}: AccountSelectorProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-6 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 fill-primary text-primary" />
        <h2 className="text-sm font-bold">Select Accounts</h2>
      </div>
      <p className="mb-3 text-sm font-semibold text-[#374151]">
        Choose Platform & Account <span className="text-primary">*</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            selected={selectedAccounts.includes(account.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}
