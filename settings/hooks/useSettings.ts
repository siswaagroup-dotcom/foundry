"use client";

import { useCallback, useMemo, useState } from "react";
import { approvalRules as approvalRulesData } from "../data/approval-rules";
import { workspaceSettings } from "../data/workspace-settings";
import type { SettingsTab } from "../types/settings-types";

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace");
  const [approvalRules] = useState(approvalRulesData);
  const [workspaceValues, setWorkspaceValues] = useState(() =>
    workspaceSettings.reduce<Record<string, string>>((values, setting) => {
      values[setting.id] = setting.value;
      return values;
    }, {}),
  );

  const workspaceFields = useMemo(
    () =>
      workspaceSettings.map((setting) => ({
        ...setting,
        value: workspaceValues[setting.id] ?? "",
      })),
    [workspaceValues],
  );

  const updateField = useCallback((id: string, value: string) => {
    setWorkspaceValues((current) => ({
      ...current,
      [id]: value,
    }));
  }, []);

  const saveSettings = useCallback(() => {
    console.log(workspaceValues);
  }, [workspaceValues]);

  return {
    activeTab,
    setActiveTab,
    workspaceFields,
    workspaceValues,
    approvalRules,
    updateField,
    saveSettings,
  };
}
