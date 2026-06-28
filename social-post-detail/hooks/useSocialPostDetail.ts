"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  useSocialPostAction,
  useSocialPostDetail as useSocialPostQuery,
  useUpdateSocialPost,
} from "@/hooks/useSocialManagement";
import type { SocialPost } from "@/types/social";

function publishToastFor(post: SocialPost) {
  const successfulTargets = post.accounts.filter((account) => account.status === "published");
  const failedTargets = post.accounts.filter((account) => account.status === "failed");
  const failedPlatforms = Array.from(new Set(failedTargets.map((account) => account.platform)));
  const providerError = failedTargets
    .map((account) => account.errorMessage)
    .find((message): message is string => Boolean(message));
  const facebookFailed = failedPlatforms.includes("facebook");

  if (failedTargets.length === 0) {
    return {
      title: "✅ Published successfully",
      variant: "success" as const,
    };
  }

  if (successfulTargets.length > 0) {
    const failedLabel = facebookFailed
      ? "Facebook"
      : failedPlatforms.map((platform) => platform.toUpperCase()).join(", ");
    return {
      title: "⚠ Partially published",
      description: `Published to ${successfulTargets.length} platforms. Failed on ${failedLabel}.${providerError ? ` ${providerError}` : ""}`,
      variant: "warning" as const,
    };
  }

  return {
    title: "❌ Failed to publish",
    description: providerError,
    variant: "error" as const,
  };
}

export function useSocialPostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const postId = params.id;
  const query = useSocialPostQuery(postId);
  const updatePost = useUpdateSocialPost();
  const publishPost = useSocialPostAction("publish");
  const deletePost = useSocialPostAction("delete");
  const [caption, setCaptionValue] = useState("");

  useEffect(() => {
    if (query.data?.caption) setCaptionValue(query.data.caption);
  }, [query.data?.caption]);

  const post = useMemo(() => {
    const data = query.data;
    return {
      id: data?.id ?? postId,
      title: data?.title || data?.caption?.slice(0, 72) || "Social post",
      platform: data?.platform ?? "multi",
      account: data?.accounts.map((account) => account.accountName).join(", ") || "No account selected",
      caption: data?.caption ?? "",
      image: data?.media[0]?.fileUrl ?? "No media attached",
      status: data?.status ?? "draft",
      scheduledDate: data?.scheduledAt ?? "",
    };
  }, [postId, query.data]);

  const breadcrumbs = useMemo(
    () => [
      { id: "social", label: "Social" },
      { id: post.id, label: post.title },
    ],
    [post.id, post.title],
  );

  const activityLog = useMemo(
    () =>
      (query.data?.logs ?? []).map((log) => ({
        id: log.id,
        user: log.platform,
        action: log.message || log.status,
        timestamp: log.createdAt,
        type: log.status,
      })),
    [query.data?.logs],
  );

  const relatedItems = useMemo(
    () => [
      {
        id: "social-calendar",
        title: "Social calendar",
        subtitle: post.scheduledDate ? `Scheduled for ${new Date(post.scheduledDate).toLocaleString()}` : "View all posts",
      },
      {
        id: "analytics",
        title: "Analytics",
        subtitle: `${query.data?.reachCount ?? 0} reach, ${query.data?.likesCount ?? 0} likes`,
      },
    ],
    [post.scheduledDate, query.data?.likesCount, query.data?.reachCount],
  );

  const publishTargets = useMemo(
    () =>
      (query.data?.accounts ?? []).map((account) => ({
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        status: account.status,
        platformPostId: account.platformPostId,
        liveUrl: account.liveUrl,
        errorMessage: account.errorMessage,
        publishedAt: account.publishedAt,
      })),
    [query.data?.accounts],
  );

  const setCaption = useCallback((value: string) => {
    setCaptionValue(value);
  }, []);

  const backToSocial = useCallback(() => {
    router.push("/dashboard/social");
  }, [router]);

  const editPost = useCallback(() => {
    updatePost.mutate({ id: postId, input: { caption } });
  }, [caption, postId, updatePost]);

  const publishNow = useCallback(async () => {
    console.log("Publish button clicked");
    if (publishPost.isPending || query.data?.status === "published") {
      console.log("Publish ignored", {
        isPending: publishPost.isPending,
        status: query.data?.status,
      });
      return;
    }

    try {
      console.log("Publishing post", postId);
      const publishedPost = (await publishPost.mutateAsync(postId)) as SocialPost;
      console.log("Publish response", publishedPost);
      toast(publishToastFor(publishedPost));
      await query.refetch();
    } catch (error) {
      console.error("Publish error", error);
      toast({
        title: "❌ Failed to publish",
        description: error instanceof Error ? error.message : "Facebook API rejected the request.",
        variant: "error",
      });
      await query.refetch();
    }
  }, [postId, publishPost, query, toast]);

  const moreActions = useCallback(() => {
    if (query.data?.status === "published") {
      deletePost.mutate(postId, { onSuccess: () => router.push("/dashboard/social") });
      return;
    }
    void publishNow();
  }, [deletePost, postId, publishNow, query.data?.status, router]);

  const openRelatedItem = useCallback((itemId: string) => {
    const targets: Record<string, string> = {
      "client-acme": "/dashboard/clients/acme-corporation",
      "social-calendar": "/dashboard/social",
      analytics: "/dashboard/social",
    };
    router.push(targets[itemId] ?? "/dashboard/social");
  }, [router]);

  return {
    breadcrumbs,
    post,
    caption,
    activityLog,
    relatedItems,
    setCaption,
    backToSocial,
    editPost,
    moreActions,
    publishNow,
    openRelatedItem,
    publishTargets,
    isLoading: query.isLoading,
    error: query.error,
    isPublishing: publishPost.isPending,
    isSaving: updatePost.isPending || publishPost.isPending || deletePost.isPending,
  };
}
