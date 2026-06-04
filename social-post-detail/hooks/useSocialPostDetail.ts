"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { activityLog as activityLogData } from "../data/activity-log";
import { breadcrumbs, postDetail } from "../data/post-detail";
import { relatedItems as relatedItemsData } from "../data/related-items";

export function useSocialPostDetail() {
  const router = useRouter();
  const [post, setPost] = useState(postDetail);
  const [caption, setCaptionValue] = useState(postDetail.caption);
  const [activityLog] = useState(activityLogData);
  const [relatedItems] = useState(relatedItemsData);

  const setCaption = useCallback((value: string) => {
    setCaptionValue(value);
    setPost((current) => ({ ...current, caption: value }));
  }, []);

  const backToSocial = useCallback(() => {
    router.push("/dashboard/social");
  }, [router]);

  const editPost = useCallback(() => {
    router.push("/dashboard/social/create");
  }, [router]);

  const moreActions = useCallback(() => {
    console.log("More Actions");
  }, []);

  const openRelatedItem = useCallback((itemId: string) => {
    const targets: Record<string, string> = {
      "client-acme": "/dashboard/clients/acme-corporation",
      "social-calendar": "/dashboard/social",
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
    openRelatedItem,
  };
}
