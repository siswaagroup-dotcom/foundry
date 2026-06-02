import { AccountCard } from "./AccountCard";
import type { SocialAccount } from "./types/social-types";

type ConnectedAccountsProps = {
  accounts: SocialAccount[];
};

export function ConnectedAccounts({
  accounts,
}: ConnectedAccountsProps) {
  return (
    <aside className="border-t border-[#E5E7EB] bg-white px-5 py-5 lg:border-l lg:border-t-0">
      <h2 className="mb-5 text-[15px] font-bold text-[#020617]">
        Connected Accounts
      </h2>

      <div className="space-y-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
          />
        ))}
      </div>
    </aside>
  );
}
