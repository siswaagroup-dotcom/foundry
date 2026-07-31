import { randomUUID } from "crypto";
import { tmpdir } from "os";
import path from "path";
import { writeFile, unlink } from "fs/promises";

import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { createSocialMedia } from "@/services/social.server";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function mediaTypeFor(mimeType: string): "image" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

function extensionFor(file: File) {
  const ext = path.extname(file.name);
  if (ext) return ext;

  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "video/mp4") return ".mp4";

  return "";
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return apiError("Upload file is required.", 400);
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return apiError("Only image and video uploads are supported.", 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return apiError("File is too large.", 400);
  }

  const tempPath = path.join(
    tmpdir(),
    `${randomUUID()}${extensionFor(file)}`
  );

  await writeFile(tempPath, Buffer.from(await file.arrayBuffer()));

  try {
    const upload = await cloudinary.uploader.upload(tempPath, {
      folder: "social",
      resource_type: file.type.startsWith("video/") ? "video" : "image",
    });

    await unlink(tempPath).catch(() => undefined);

    const result = await createSocialMedia(
      auth.ctx.workspaceId,
      auth.ctx.userId,
      {
        fileName: file.name,
        fileUrl: upload.secure_url,
        mimeType: file.type,
        fileSizeBytes: file.size,
        mediaType: mediaTypeFor(file.type),
      }
    );

    if (!result.success) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess(result.data, 201);
  } catch (err) {
    await unlink(tempPath).catch(() => undefined);
    console.error("[api.social.media.upload]", err);
    return apiError("Failed to upload media.", 500);
  }
}
