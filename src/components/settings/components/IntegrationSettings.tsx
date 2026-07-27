"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsData } from "../types/settings-types";

type Props = {
  integrations: SettingsData["integrations"];
  onChange: (integrations: SettingsData["integrations"]) => void;
  onSave: () => void;
  saving: boolean;
};

type IntegrationId = "resend" | "openai" | "github";

type IntegrationConfig = {
  id: IntegrationId;
  label: string;
  description: string;
  credentialsKey: "resendCredentials" | "openaiCredentials" | "githubCredentials";
  fieldLabel: string;
  emptyPlaceholder: string;
  existsPlaceholder: string;
};

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "resend",
    label: "Resend",
    description: "Transactional email delivery for invitations and notifications.",
    credentialsKey: "resendCredentials",
    fieldLabel: "API Key",
    emptyPlaceholder: "re_xxxxxxxxxxxxxxxxxxxxxxxx",
    existsPlaceholder: "Enter new key to replace existing",
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "AI-powered features across the workspace.",
    credentialsKey: "openaiCredentials",
    fieldLabel: "API Key",
    emptyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
    existsPlaceholder: "Enter new key to replace existing",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Link pull requests and issues to tasks and projects.",
    credentialsKey: "githubCredentials",
    fieldLabel: "Personal Access Token",
    emptyPlaceholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
    existsPlaceholder: "Enter new token to replace existing",
  },
];

function ApiKeyField({
  fieldLabel,
  value,
  hasExistingKey,
  onChange,
  emptyPlaceholder,
  existsPlaceholder,
}: {
  fieldLabel: string;
  value: string;
  hasExistingKey: boolean;
  onChange: (v: string) => void;
  emptyPlaceholder: string;
  existsPlaceholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-[#374151]">{fieldLabel}</Label>
        {hasExistingKey && (
          <span className="text-xs text-emerald-600 font-medium">● Key saved</span>
        )}
      </div>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hasExistingKey ? existsPlaceholder : emptyPlaceholder}
          className="h-9 pr-10 text-sm font-mono"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
          aria-label={visible ? "Hide" : "Show"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hasExistingKey && (
        <p className="text-xs text-[#9ca3af]">
          A key is already saved. Leave blank to keep the current key, or type a new one to replace it.
        </p>
      )}
    </div>
  );
}

export function IntegrationSettings({ integrations, onChange, onSave, saving }: Props) {
  const [expanded, setExpanded] = useState<IntegrationId | null>(null);

  function handleToggleConnected(item: IntegrationConfig) {
    onChange({ ...integrations, [item.id]: !integrations[item.id] });
  }

  function handleKeyChange(item: IntegrationConfig, value: string) {
    const current = integrations[item.credentialsKey] ?? {};
    onChange({
      ...integrations,
      [item.credentialsKey]: { ...current, newApiKey: value },
    });
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-[#edf0f3] rounded-xl border border-[#edf0f3] bg-white overflow-hidden">
        {INTEGRATIONS.map((item) => {
          const connected = integrations[item.id];
          const credentials = integrations[item.credentialsKey] ?? {};
          const hasExistingKey = Boolean(credentials.hasKey);
          const currentInput = credentials.newApiKey ?? "";
          const isExpanded = expanded === item.id;
          const ConnectedIcon = connected ? CheckCircle2 : Circle;

          return (
            <div key={item.id}>
              {/* Header row */}
              <div className="flex items-center gap-4 p-4">
                {/* Toggle connected */}
                <button
                  type="button"
                  onClick={() => handleToggleConnected(item)}
                  className="flex-shrink-0"
                  aria-label={connected ? `Disconnect ${item.label}` : `Connect ${item.label}`}
                >
                  <ConnectedIcon
                    className={connected ? "h-5 w-5 text-emerald-600" : "h-5 w-5 text-[#9ca3af]"}
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#111827]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#6b7280]">
                    {item.description}
                  </span>
                </div>

                {/* Status badge */}
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    connected
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {connected ? "Connected" : "Disconnected"}
                </span>

                {/* Expand / collapse */}
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => (prev === item.id ? null : item.id))}
                  className="flex-shrink-0 rounded-md p-1 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Edit credentials"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Credential panel */}
              {isExpanded && (
                <div className="border-t border-[#edf0f3] bg-[#f9fafb] px-4 py-4">
                  <ApiKeyField
                    fieldLabel={item.fieldLabel}
                    value={currentInput}
                    hasExistingKey={hasExistingKey}
                    onChange={(v) => handleKeyChange(item, v)}
                    emptyPlaceholder={item.emptyPlaceholder}
                    existsPlaceholder={item.existsPlaceholder}
                  />
                </div>
              )}
            </div>
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
