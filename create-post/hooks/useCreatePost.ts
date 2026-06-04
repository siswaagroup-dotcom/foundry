"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPostConfig } from "../data/create-post-config";
import { postSettings } from "../data/post-settings";
import { socialAccounts } from "../data/social-accounts";
import type { UploadedMedia } from "../types/create-post-types";

export function useCreatePost() {
  const router = useRouter();
  const [selectedAccounts, setSelectedAccounts] = useState(
    socialAccounts.filter((account) => account.selected).map((account) => account.id),
  );
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [settings, setSettings] = useState(() =>
    postSettings.reduce<Record<string, boolean>>((values, setting) => {
      values[setting.id] = setting.enabled;
      return values;
    }, {}),
  );

  const validation = useMemo(
    () => ({
      content: content.length <= createPostConfig.maxLength,
      schedule: Boolean(date) === Boolean(time),
      accounts: selectedAccounts.length > 0,
    }),
    [content.length, date, selectedAccounts.length, time],
  );

  const formData = useMemo(
    () => ({ selectedAccounts, content, media, date, time, settings }),
    [content, date, media, selectedAccounts, settings, time],
  );

  const toggleAccount = useCallback((accountId: string) => {
    setSelectedAccounts((current) =>
      current.includes(accountId)
        ? current.filter((id) => id !== accountId)
        : [...current, accountId],
    );
  }, []);

  const updateContent = useCallback((value: string) => {
    setContent(value.slice(0, createPostConfig.maxLength));
  }, []);

  const addMedia = useCallback((files: File[]) => {
    setMedia((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const toggleSetting = useCallback((settingId: string) => {
    setSettings((current) => ({
      ...current,
      [settingId]: !current[settingId],
    }));
  }, []);

  const saveDraft = useCallback(() => console.log(formData), [formData]);
  const schedulePost = useCallback(() => console.log(formData), [formData]);
  const cancel = useCallback(() => router.push("/dashboard/social"), [router]);

  useEffect(() => {
    return () => {
      media.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [media]);

  return {
    accounts: socialAccounts,
    config: createPostConfig,
    settingsConfig: postSettings,
    selectedAccounts,
    content,
    media,
    date,
    time,
    settings,
    validation,
    toggleAccount,
    updateContent,
    addMedia,
    setDate,
    setTime,
    toggleSetting,
    saveDraft,
    schedulePost,
    cancel,
  };
}
