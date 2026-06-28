"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSocialMedia,
  createSocialPost,
  deleteSocialIntegration,
  deleteSocialMedia,
  deleteSocialPost,
  disconnectSocialIntegration,
  duplicateSocialPost,
  fetchSocialAnalytics,
  fetchSocialDashboard,
  fetchSocialPost,
  publishSocialPost,
  refreshSocialIntegration,
  saveSocialIntegration,
  scheduleSocialPost,
  testSocialIntegration,
  unscheduleSocialPost,
  updateSocialPost,
  type CreateSocialMediaInput,
  type CreateSocialPostInput,
  type SaveSocialIntegrationInput,
  type UpdateSocialPostInput,
} from "@/services/social.service";

export const SOCIAL_QUERY_KEY = ["social"] as const;
const dashboardKey = [...SOCIAL_QUERY_KEY, "dashboard"] as const;
const analyticsKey = [...SOCIAL_QUERY_KEY, "analytics"] as const;
const detailKey = (id: string) => [...SOCIAL_QUERY_KEY, "post", id] as const;

function useSocialInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEY });
}

export function useSocialDashboard() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: fetchSocialDashboard,
    staleTime: 30_000,
  });
}

export function useSocialAnalytics() {
  return useQuery({
    queryKey: analyticsKey,
    queryFn: fetchSocialAnalytics,
    staleTime: 60_000,
  });
}

export function useSocialPostDetail(id: string) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => fetchSocialPost(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useSaveSocialIntegration() {
  const invalidate = useSocialInvalidate();
  return useMutation({
    mutationFn: (input: SaveSocialIntegrationInput) => saveSocialIntegration(input),
    onSuccess: invalidate,
  });
}

export function useIntegrationAction(action: "test" | "refresh" | "disconnect" | "delete") {
  const invalidate = useSocialInvalidate();
  const mutationFn = {
    test: testSocialIntegration,
    refresh: refreshSocialIntegration,
    disconnect: disconnectSocialIntegration,
    delete: deleteSocialIntegration,
  }[action];

  return useMutation({
    mutationFn: (id: string) => mutationFn(id),
    onSettled: invalidate,
  });
}

export function useCreateSocialPost() {
  const invalidate = useSocialInvalidate();
  return useMutation({
    mutationFn: (input: CreateSocialPostInput) => createSocialPost(input),
    onSuccess: invalidate,
  });
}

export function useUpdateSocialPost() {
  const invalidate = useSocialInvalidate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSocialPostInput }) =>
      updateSocialPost(id, input),
    onSuccess: (_post, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: detailKey(variables.id) });
    },
  });
}

export function useSocialPostAction(
  action: "publish" | "duplicate" | "delete" | "unschedule"
) {
  const invalidate = useSocialInvalidate();
  const mutationFn = {
    publish: publishSocialPost,
    duplicate: duplicateSocialPost,
    delete: deleteSocialPost,
    unschedule: unscheduleSocialPost,
  }[action];

  return useMutation({
    mutationFn: (id: string) => mutationFn(id),
    onSuccess: (data, id) => {
      console.log(`Social ${action} mutation success`, { id, data });
    },
    onError: (error, id) => {
      console.error(`Social ${action} mutation error`, { id, error });
    },
    onSettled: () => {
      console.log(`Social ${action} mutation settled; invalidating social queries`);
      invalidate();
    },
  });
}

export function useScheduleSocialPost() {
  const invalidate = useSocialInvalidate();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      scheduleSocialPost(id, scheduledAt),
    onSuccess: invalidate,
  });
}

export function useCreateSocialMedia() {
  const invalidate = useSocialInvalidate();
  return useMutation({
    mutationFn: (input: CreateSocialMediaInput) => createSocialMedia(input),
    onSuccess: invalidate,
  });
}

export function useDeleteSocialMedia() {
  const invalidate = useSocialInvalidate();
  return useMutation({
    mutationFn: (id: string) => deleteSocialMedia(id),
    onSuccess: invalidate,
  });
}
