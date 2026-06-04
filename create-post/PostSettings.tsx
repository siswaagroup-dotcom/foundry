import { Settings } from "lucide-react";
import type { PostSetting } from "./types/create-post-types";

type PostSettingsProps = {
  settingsConfig: PostSetting[];
  settings: Record<string, boolean>;
  onToggle: (id: string) => void;
};

export function PostSettings({
  settingsConfig,
  settings,
  onToggle,
}: PostSettingsProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <Settings className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold">Post Settings</h2>
      </div>
      <div className="space-y-3">
        {settingsConfig.map((setting) => (
          <label key={setting.id} className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[#374151]">{setting.label}</span>
            <input
              type="checkbox"
              checked={Boolean(settings[setting.id])}
              onChange={() => onToggle(setting.id)}
              className="h-4 w-4 rounded border-[#cbd5e1] accent-primary"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
