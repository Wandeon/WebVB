import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as R2Module from './r2';

let r2: typeof R2Module;

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = vi.fn().mockResolvedValue({});
  },
  PutObjectCommand: class {},
  DeleteObjectCommand: class {},
}));

vi.mock('@repo/shared', () => ({
  getAdminR2Env: () => ({
    CLOUDFLARE_ACCOUNT_ID: 'account',
    CLOUDFLARE_R2_ACCESS_KEY_ID: 'access',
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'secret',
    CLOUDFLARE_R2_BUCKET_NAME: 'bucket',
    CLOUDFLARE_R2_PUBLIC_URL: 'https://r2.example.com',
  }),
}));

describe('r2 helpers', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    r2 = await import('./r2');
  });

  it('returns all variant keys for an uploaded image URL', () => {
    const keys = r2.getR2ImageVariantKeysFromUrl(
      'https://r2.example.com/uploads/abc123/large.webp'
    );

    expect(keys).toEqual([
      'uploads/abc123/thumb.webp',
      'uploads/abc123/medium.webp',
      'uploads/abc123/large.webp',
    ]);
  });

  it('returns null for non-R2 URLs', () => {
    const keys = r2.getR2ImageVariantKeysFromUrl('https://example.com/other.png');

    expect(keys).toBeNull();
  });

  it('deletes all variants when removing an uploaded image', async () => {
    const deleteSpy = vi.fn().mockResolvedValue(undefined);

    await r2.deleteImageVariantsFromUrl(
      'https://r2.example.com/uploads/xyz789/medium.webp',
      deleteSpy
    );

    expect(deleteSpy).toHaveBeenCalledTimes(3);
    expect(deleteSpy).toHaveBeenCalledWith('uploads/xyz789/thumb.webp');
    expect(deleteSpy).toHaveBeenCalledWith('uploads/xyz789/medium.webp');
    expect(deleteSpy).toHaveBeenCalledWith('uploads/xyz789/large.webp');
  });
});
