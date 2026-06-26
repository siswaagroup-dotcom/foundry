import { CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SettingsData } from "../types/settings-types";

type Props = {
  integrations: SettingsData["integrations"];
  onChange: (integrations: SettingsData["integrations"]) => void;
  onSave: () => void;
  saving: boolean;
};

const INTEGRATION_ITEMS: { id: keyof SettingsData["integrations"]; label: string }[] = [
  { id: "resend", label: "Resend" },
  { id: "openai", label: "OpenAI" },
  { id: "github", label: "GitHub" },
];

export function IntegrationSettings({ integrations, onChange, onSave, saving }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {INTEGRATION_ITEMS.map((item) => {
          const connected = integrations[item.id];
          const Icon = connected ? CheckCircle2 : Circle;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...integrations, [item.id]: !connected })}
              className="flex items-center justify-between rounded-xl border border-[#edf0f3] p-4 text-left transition-colors hover:bg-[#f8fafc]"
            >
              <span>
                <span className="block text-sm font-semibold text-[#111827]">{item.label}</span>
                <span className="mt-1 block text-xs text-[#6b7280]">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </span>
              <Icon className={connected ? "h-5 w-5 text-emerald-600" : "h-5 w-5 text-[#9ca3af]"} />
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Integrations"}
        </Button>
      </div>
    </div>
  );
}
