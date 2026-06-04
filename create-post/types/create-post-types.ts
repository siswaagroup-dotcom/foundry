export interface SocialAccount {
  id: string;
  name: string;
  handle: string;
  platform: string;
  icon: string;
  selected?: boolean;
}

export interface PostSetting {
  id: string;
  label: string;
  enabled: boolean;
}

export interface CreatePostConfig {
  maxLength: number;
  contentPlaceholder: string;
  acceptedMedia: string;
}

export interface UploadedMedia {
  id: string;
  name: string;
  type: string;
  previewUrl: string;
}

export interface CreatePostFormData {
  selectedAccounts: string[];
  content: string;
  media: UploadedMedia[];
  date: string;
  time: string;
  settings: Record<string, boolean>;
}
