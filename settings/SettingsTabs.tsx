import { cn } from "@/lib/utils";
import type { SettingsTab } from "./types/settings-types";

type SettingsTabsProps = {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "workspace", label: "Workspace" },
  { id: "profile", label: "Profile" },
  { id: "team", label: "Team" },
  { id: "expense-policies", label: "Expense Policies" },
  { id: "crm", label: "CRM" },
  { id: "integrations", label: "Integrations" },
  { id: "billing", label: "Billing" },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "h-9 rounded-lg px-3 text-sm font-semibold transition-colors",
            activeTab === tab.id
              ? "bg-orange-50 text-primary"
              : "text-[#6b7280] hover:bg-[#f8fafc] hover:text-[#111827]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
