import { Image } from "lucide-react";
import type { CreatePostConfig, UploadedMedia } from "./types/create-post-types";

type MediaUploadProps = {
  config: CreatePostConfig;
  media: UploadedMedia[];
  onUpload: (files: File[]) => Promise<void>;
};

export function MediaUpload({ config, media, onUpload }: MediaUploadProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-6 flex items-center gap-2">
        <Image className="h-4 w-4 fill-primary text-primary" />
        <h2 className="text-sm font-bold">Media</h2>
      </div>
      <p className="mb-3 text-sm font-semibold text-[#374151]">
        Upload Images or Videos
      </p>
      <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#cbd5e1] bg-white text-center">
        <Image className="h-8 w-8 text-[#cbd5e1]" />
        <span className="mt-3 text-sm font-semibold text-[#6b7280]">
          Drop files here or browse
        </span>
        <input
          type="file"
          multiple
          accept={config.acceptedMedia}
          onChange={(event) => {
            void onUpload(Array.from(event.target.files ?? [])).catch(
              (error) => {
                console.error("Create post media upload failed", error);
              },
            );
            event.currentTarget.value = "";
          }}
          className="sr-only"
        />
      </label>
      {media.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-[#e5e7eb]">
              {item.type.startsWith("video") ? (
                <video src={item.previewUrl} className="h-24 w-full object-cover" />
              ) : (
                <img src={item.previewUrl} alt={item.name} className="h-24 w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
