import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getAdminR2Env, type AdminR2Env } from '@repo/shared';

// Lazy initialization to avoid build-time validation failures
let r2Env: AdminR2Env | null = null;
let r2Client: S3Client | null = null;

function getR2Env(): AdminR2Env {
  if (!r2Env) {
    r2Env = getAdminR2Env();
  }
  return r2Env;
}

function getR2Client(): S3Client {
  if (!r2Client) {
    const env = getR2Env();
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2Client;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const env = getR2Env();
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const env = getR2Env();
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export function getR2KeyFromUrl(url: string): string | null {
  const env = getR2Env();
  if (!url.startsWith(env.CLOUDFLARE_R2_PUBLIC_URL)) return null;
  return url.replace(`${env.CLOUDFLARE_R2_PUBLIC_URL}/`, '');
}

export function getR2ImageVariantKeysFromUrl(url: string): string[] | null {
  const key = getR2KeyFromUrl(url);
  if (!key) return null;

  const match = key.match(/^uploads\/([^/]+)\/(thumb|medium|large)\.webp$/);
  if (!match) {
    return [key];
  }

  const id = match[1];
  return [
    `uploads/${id}/thumb.webp`,
    `uploads/${id}/medium.webp`,
    `uploads/${id}/large.webp`,
  ];
}

export async function deleteImageVariantsFromUrl(
  url: string,
  deleteFn: (key: string) => Promise<void> = deleteFromR2
): Promise<void> {
  const keys = getR2ImageVariantKeysFromUrl(url);
  if (!keys) return;
  await Promise.all(keys.map((key) => deleteFn(key)));
}
