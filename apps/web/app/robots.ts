import { getPublicEnv } from '@repo/shared';

import type { MetadataRoute } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
