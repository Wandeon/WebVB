import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getAdminR2Env } from '@repo/shared';

const r2Env = getAdminR2Env();

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2Env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2Env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: r2Env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2Env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${r2Env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2Env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export function getR2KeyFromUrl(url: string): string | null {
  if (!url.startsWith(r2Env.CLOUDFLARE_R2_PUBLIC_URL)) return null;
  return url.replace(`${r2Env.CLOUDFLARE_R2_PUBLIC_URL}/`, '');
}
