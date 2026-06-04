import type { PostSetting } from "../types/create-post-types";

export const postSettings: PostSetting[] = [
  {
    id: "allowComments",
    label: "Allow comments",
    enabled: true,
  },
  {
    id: "trackEngagement",
    label: "Track engagement",
    enabled: true,
  },
  {
    id: "notifyTeam",
    label: "Notify team when scheduled",
    enabled: false,
  },
];
