import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";
import { requiredEnv } from "./config";
import { CmsError } from "./errors";
import { getDb } from "./database";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export async function validateImage(bytes: Uint8Array) {
  if (!bytes.length || bytes.byteLength > MAX_IMAGE_BYTES) throw new CmsError(413, "IMAGE_TOO_LARGE", "Ảnh phải có dung lượng tối đa 3 MiB.");
  const type = await fileTypeFromBuffer(bytes).catch(() => undefined);
  if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type.mime)) throw new CmsError(400, "IMAGE_TYPE", "Chỉ nhận ảnh JPEG, PNG hoặc WebP.");
  return type;
}
export async function uploadImage(bytes: Uint8Array, actor: string) {
  await validateImage(bytes);
  const database = await getDb();
  cloudinary.config({ cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"), api_key: requiredEnv("CLOUDINARY_API_KEY"), api_secret: requiredEnv("CLOUDINARY_API_SECRET"), secure: true });
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: "image", folder: "portfolio-cms", allowed_formats: ["jpg", "png", "webp"], timeout: 20000 }, (error, result) => {
      if (error || !result) reject(error ?? new Error("Upload returned no image")); else resolve(result);
    });
    stream.on("error", reject);
    stream.end(Buffer.from(bytes));
  });
  const image = { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height };
  await database.collection("media").insertOne({ ...image, createdAt: new Date(), createdBy: actor });
  return image;
}
