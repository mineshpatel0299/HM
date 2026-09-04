import "server-only";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_URL_TTL_SECONDS = 60 * 5;

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * `{coupleId}/{feature}/{uuid}.{ext}` — every media feature (photos, voice
 * notes, video messages, avatars) shares this convention so objects stay
 * scoped and browsable per couple, per feature.
 */
export function buildObjectKey(coupleId: string, feature: string, ext: string): string {
  const cleanExt = ext.replace(/^\.+/, "").toLowerCase();
  return `${coupleId}/${feature}/${randomUUID()}.${cleanExt}`;
}

export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });
}

export function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/+$/, "");
  return `${base}/${key}`;
}
