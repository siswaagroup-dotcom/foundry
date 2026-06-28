"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateSocialPost as useCreateSocialPostMutation,
  useSocialPostAction,
  useSocialDashboard,
} from "@/hooks/useSocialManagement";
import { uploadSocialMediaFile } from "@/services/social.service";
import { createPostConfig } from "../data/create-post-config";
import { postSettings } from "../data/post-settings";
import type { SocialAccount, UploadedMedia } from "../types/create-post-types";

const platformIcon: Record<string, string> = {
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  x: "twitter",
  youtube: "youtube",
};

export function useCreatePost() {
  const router = useRouter();
  const dashboard = useSocialDashboard();
  const createPost = useCreateSocialPostMutation();
  const publishPost = useSocialPostAction("publish");
  const accounts = useMemo<SocialAccount[]>(
    () =>
      (dashboard.data?.accounts ?? [])
        .filter((account) => account.status === "connected")
        .map((account) => ({
          id: account.id,
          name: account.accountName,
          handle: account.handle,
          platform: account.platform,
          icon: platformIcon[account.platform] ?? "twitter",
        })),
    [dashboard.data?.accounts],
  );
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
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

  const addMedia = useCallback(async (files: File[]) => {
    if (!files.length) return;
    console.log("Create post media selected", {
      count: files.length,
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    });

    setIsUploadingMedia(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const asset = await uploadSocialMediaFile(file);
          console.log("Create post media uploaded", {
            name: file.name,
            fileUrl: asset.fileUrl,
            mimeType: asset.mimeType,
            fileSizeBytes: asset.fileSizeBytes,
            isHttps: asset.fileUrl.startsWith("https://"),
          });
          return {
            id: asset.id,
            name: asset.fileName,
            type: asset.mimeType,
            fileUrl: asset.fileUrl,
            mimeType: asset.mimeType,
            fileSizeBytes: asset.fileSizeBytes ?? file.size,
            previewUrl,
          };
        }),
      );

      setMedia((current) => {
        const next = [...current, ...uploaded];
        console.log("Create post media state updated", {
          previousCount: current.length,
          addedCount: uploaded.length,
          nextMedia: next.map((item) => ({
            id: item.id,
            fileUrl: item.fileUrl,
            mimeType: item.mimeType,
            fileSizeBytes: item.fileSizeBytes,
          })),
        });
        return next;
      });
    } finally {
      setIsUploadingMedia(false);
    }
  }, []);

  const toggleSetting = useCallback((settingId: string) => {
    setSettings((current) => ({
      ...current,
      [settingId]: !current[settingId],
    }));
  }, []);

  const submitPost = useCallback(
    async (status: "draft" | "scheduled" | "publish") => {
      if (!validation.content || !validation.accounts || !validation.schedule) return;
      if (isUploadingMedia) return;
      const scheduledAt = date && time ? new Date(`${date}T${time}`).toISOString() : null;
      const payload = {
        caption: content.trim(),
        accountIds: selectedAccounts,
        status: status === "publish" ? "draft" : status,
        scheduledAt,
        media: media.map((item) => ({
          fileUrl: item.fileUrl,
          mimeType: item.mimeType,
          fileSizeBytes: item.fileSizeBytes,
        })),
      };
      console.log("Create social post request payload", payload);
      const created = await createPost.mutateAsync(payload);
      if (status === "publish") {
        await publishPost.mutateAsync(created.id);
      }
      router.push("/dashboard/social");
    },
    [content, createPost, date, isUploadingMedia, media, publishPost, router, selectedAccounts, time, validation],
  );

  const saveDraft = useCallback(() => submitPost("draft"), [submitPost]);
  const schedulePost = useCallback(() => submitPost("scheduled"), [submitPost]);
  const publishNow = useCallback(() => submitPost("publish"), [submitPost]);
  const cancel = useCallback(() => router.push("/dashboard/social"), [router]);
  const connectAccounts = useCallback(() => router.push("/dashboard/social/accounts"), [router]);

  useEffect(() => {
    return () => {
      media.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [media]);

  return {
    accounts,
    config: createPostConfig,
    settingsConfig: postSettings,
    selectedAccounts,
    content,
    media,
    date,
    time,
    settings,
    validation,
    isLoading: dashboard.isLoading,
    isSubmitting: createPost.isPending || publishPost.isPending || isUploadingMedia,
    error: dashboard.error ?? createPost.error,
    toggleAccount,
    updateContent,
    addMedia,
    setDate,
    setTime,
    toggleSetting,
    saveDraft,
    schedulePost,
    publishNow,
    cancel,
    connectAccounts,
  };
}
