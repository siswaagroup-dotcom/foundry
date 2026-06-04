import type { CreatePostConfig } from "../types/create-post-types";

export const createPostConfig: CreatePostConfig = {
  maxLength: 280,
  contentPlaceholder: "What's on your mind? Share your message here...",
  acceptedMedia: "image/*,video/*",
};
