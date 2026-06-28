import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm } from "@/lib/api-client";
import type {
  CreateSocialMediaInput,
  CreateSocialPostInput,
  SaveSocialIntegrationInput,
  SocialAnalytics,
  SocialDashboard,
  SocialIntegration,
  SocialMediaAsset,
  SocialPost,
  UpdateSocialPostInput,
} from "@/types/social";

const BASE = "/api/social";

export type {
  CreateSocialMediaInput,
  CreateSocialPostInput,
  SaveSocialIntegrationInput,
  SocialAccount,
  SocialAnalytics,
  SocialDashboard,
  SocialIntegration,
  SocialMediaAsset,
  SocialPlatform,
  SocialPost,
  UpdateSocialPostInput,
} from "@/types/social";

export const fetchSocialDashboard = (): Promise<SocialDashboard> => apiGet(BASE);
export const fetchSocialAnalytics = (): Promise<SocialAnalytics> =>
  apiGet(`${BASE}/analytics`);

export const saveSocialIntegration = (
  input: SaveSocialIntegrationInput
): Promise<SocialIntegration> => apiPost(`${BASE}/integrations`, input);

export const disconnectSocialIntegration = (id: string): Promise<{ id: string }> =>
  apiPatch(`${BASE}/integrations/${id}`, {});

export const deleteSocialIntegration = (id: string): Promise<{ id: string }> =>
  apiDelete(`${BASE}/integrations/${id}`);

export const testSocialIntegration = (id: string): Promise<SocialIntegration> =>
  apiPost(`${BASE}/integrations/${id}/test`, {});

export const refreshSocialIntegration = (id: string): Promise<SocialIntegration> =>
  apiPost(`${BASE}/integrations/${id}/refresh`, {});

export const fetchSocialPosts = (): Promise<SocialPost[]> => apiGet(`${BASE}/posts`);
export const fetchSocialPost = (id: string): Promise<SocialPost> =>
  apiGet(`${BASE}/posts/${id}`);

export const createSocialPost = (input: CreateSocialPostInput): Promise<SocialPost> => {
  console.log("createSocialPost API payload", input);
  return apiPost(`${BASE}/posts`, input);
};

export const uploadSocialMediaFile = (file: File): Promise<SocialMediaAsset> => {
  const body = new FormData();
  body.append("file", file);
  console.log("Uploading social media file", {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  return apiPostForm(`${BASE}/media/upload`, body);
};

export const updateSocialPost = (
  id: string,
  input: UpdateSocialPostInput
): Promise<SocialPost> => apiPatch(`${BASE}/posts/${id}`, input);

export const deleteSocialPost = (id: string): Promise<{ id: string }> =>
  apiDelete(`${BASE}/posts/${id}`);

export const duplicateSocialPost = (id: string): Promise<SocialPost> =>
  apiPost(`${BASE}/posts/${id}/duplicate`, {});

export const publishSocialPost = async (id: string): Promise<SocialPost> => {
  console.log("Publishing post", id);
  try {
    const response = await apiPost<SocialPost>(`${BASE}/posts/${id}/publish`, {});
    console.log("Publish response", response);
    return response;
  } catch (error) {
    console.error("Publish error", error);
    throw error;
  }
};

export const scheduleSocialPost = (
  id: string,
  scheduledAt: string
): Promise<SocialPost> => apiPost(`${BASE}/posts/${id}/schedule`, { scheduledAt });

export const unscheduleSocialPost = (id: string): Promise<SocialPost> =>
  apiPost(`${BASE}/posts/${id}/unschedule`, {});

export const fetchSocialMedia = (): Promise<SocialMediaAsset[]> =>
  apiGet(`${BASE}/media`);

export const createSocialMedia = (
  input: CreateSocialMediaInput
): Promise<SocialMediaAsset> => apiPost(`${BASE}/media`, input);

export const deleteSocialMedia = (id: string): Promise<{ id: string }> =>
  apiDelete(`${BASE}/media/${id}`);
