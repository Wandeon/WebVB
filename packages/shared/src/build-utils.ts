/**
 * Build-time utilities for static export
 *
 * These utilities help ensure builds are deterministic and fail loudly
 * when data sources are unavailable.
 */

/**
 * Environment check for build behavior
 * - In production/CI: DB access is required, builds should fail if unavailable
 * - In local dev: Can optionally allow empty fallback with explicit opt-in
 */
export function shouldAllowEmptyFallback(): boolean {
  // Only allow empty fallback if explicitly opted in AND not in CI/production
  const isCI = process.env.CI === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const allowEmpty = process.env.ALLOW_EMPTY_STATIC_PARAMS === 'true';

  return allowEmpty && !isCI && !isProduction;
}

/**
 * Wrapper for generateStaticParams that enforces proper build behavior
 *
 * Usage:
 * ```typescript
 * export async function generateStaticParams() {
 *   return withStaticParams('/vijesti/[slug]', async () => {
 *     const { posts } = await postsRepository.findPublished({ limit: 100 });
 *     return posts.map((post) => ({ slug: post.slug }));
 *   });
 * }
 * ```
 */
export async function withStaticParams<T extends Record<string, unknown>[]>(
  route: string,
  fetchParams: () => Promise<T>
): Promise<T> {
  try {
    const params = await fetchParams();

    // Log for build visibility
    console.log(`[generateStaticParams] ${route}: ${params.length} params generated`);

    return params;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (shouldAllowEmptyFallback()) {
      console.warn(
        `[generateStaticParams] ${route}: DB unavailable, returning empty (dev mode). ` +
        `Error: ${errorMessage}`
      );
      return [] as unknown as T;
    }

    // In production/CI, fail the build loudly
    console.error(
      `[generateStaticParams] ${route}: FATAL - Cannot generate static params. ` +
      `Error: ${errorMessage}`
    );
    throw new Error(
      `Static export failed for ${route}: Database is required for generateStaticParams. ` +
      `Set ALLOW_EMPTY_STATIC_PARAMS=true for local dev without DB.`
    );
  }
}
