/**
 * CDN URL Validation & CSP Config Sync Audit Script
 *
 * Scans apps/web source files for Cloudflare R2 CDN URLs, validates each
 * with a HEAD request, and checks CSP/API URL configuration coupling.
 *
 * Closes: #155 (build-time URL validation)
 * Closes: #165 (CSP/API URL coupling documentation)
 *
 * Run with: npx tsx scripts/audit/validate-cdn-urls.ts
 */

import { readFileSync, globSync } from 'node:fs';
import { resolve } from 'node:path';

// Project root -- script must be run from the workspace root
const PROJECT_ROOT = process.cwd();

// Matches Cloudflare R2 public bucket URLs
const R2_URL_PATTERN = /https:\/\/pub-[a-f0-9]+\.r2\.dev\/[^\s"')>]+/g;

// Rate limiting: 50ms between HEAD requests to avoid R2 rate limits
const DELAY_MS = 50;

// Request timeout in milliseconds
const REQUEST_TIMEOUT_MS = 10_000;

interface FoundUrl {
  file: string;
  url: string;
  line: number;
}

interface ValidationResult {
  url: string;
  file: string;
  line: number;
  status: 'ok' | 'broken' | 'unreachable';
  httpStatus: number | null;
  error: string | null;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Scan source files for R2 CDN URLs
 */
function scanForR2Urls(): FoundUrl[] {
  const pattern = 'apps/web/**/*.{tsx,ts,mdx}';

  const files = globSync(pattern, {
    cwd: PROJECT_ROOT,
    exclude: (f) => String(f).includes('node_modules'),
  });

  const allUrls: FoundUrl[] = [];

  for (const relativeFile of files) {
    const absolutePath = resolve(PROJECT_ROOT, relativeFile);
    const content = readFileSync(absolutePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const matches = line.matchAll(R2_URL_PATTERN);
      for (const match of matches) {
        allUrls.push({
          file: relativeFile,
          url: match[0],
          line: i + 1,
        });
      }
    }
  }

  return allUrls;
}

/**
 * Validate a single URL with a HEAD request
 */
async function validateUrl(entry: FoundUrl): Promise<ValidationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(entry.url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        ...entry,
        status: 'ok',
        httpStatus: response.status,
        error: null,
      };
    }

    return {
      ...entry,
      status: 'broken',
      httpStatus: response.status,
      error: `HTTP ${response.status}`,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Timeout'
          : err.message
        : 'Unknown error';

    return {
      ...entry,
      status: 'unreachable',
      httpStatus: null,
      error: message,
    };
  }
}

/**
 * Check CSP/API URL configuration coupling
 *
 * NEXT_PUBLIC_API_URL must match the connect-src directive in the
 * production Caddyfile's Content-Security-Policy header. If these
 * values diverge, the browser will block API requests.
 *
 * Config locations:
 *   - API URL: NEXT_PUBLIC_API_URL env var (set at build time)
 *   - CSP:     scripts/caddy/Caddyfile.example connect-src directive
 *
 * When changing either value, update both locations and redeploy.
 */
function checkCspApiSync(): void {
  console.info('');
  console.info('CSP / API URL Configuration Sync');
  console.info('-'.repeat(40));

  const apiUrl = process.env['NEXT_PUBLIC_API_URL'];

  if (apiUrl) {
    console.info(`  NEXT_PUBLIC_API_URL = ${apiUrl}`);
  } else {
    console.info('  NEXT_PUBLIC_API_URL is not set (OK for static-only builds)');
  }

  // Read the Caddyfile example to check for connect-src
  try {
    const caddyfilePath = resolve(PROJECT_ROOT, 'scripts/caddy/Caddyfile.example');
    const caddyContent = readFileSync(caddyfilePath, 'utf8');

    const connectSrcMatch = caddyContent.match(/connect-src\s+([^;]+)/);
    if (connectSrcMatch) {
      const connectSrcValue = connectSrcMatch[1] ?? '';
      console.info(`  Caddyfile connect-src = ${connectSrcValue.trim()}`);
    } else {
      console.info('  Caddyfile has no connect-src directive (static-only, no API calls)');
    }

    if (apiUrl && connectSrcMatch) {
      const connectSrc = connectSrcMatch[1] ?? '';
      if (!connectSrc.includes(apiUrl)) {
        console.info('');
        console.info('  WARNING: NEXT_PUBLIC_API_URL is not in Caddyfile connect-src!');
        console.info('  The browser will block API requests unless CSP is updated.');
        console.info('  Update scripts/caddy/Caddyfile.example and redeploy Caddy.');
      } else {
        console.info('  Status: API URL matches CSP connect-src');
      }
    }
  } catch {
    console.info('  Could not read scripts/caddy/Caddyfile.example');
    if (apiUrl) {
      console.info('  Manually verify NEXT_PUBLIC_API_URL matches connect-src in production Caddyfile.');
    }
  }

  console.info('');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.info('CDN URL Validation Audit');
  console.info('='.repeat(50));
  console.info('');

  const startTime = Date.now();

  // Phase 1: Scan for R2 URLs
  console.info('Scanning apps/web for R2 CDN URLs...');
  const foundUrls = scanForR2Urls();

  // Deduplicate URLs (same URL may appear in multiple files)
  const uniqueUrls = new Map<string, FoundUrl>();
  for (const entry of foundUrls) {
    if (!uniqueUrls.has(entry.url)) {
      uniqueUrls.set(entry.url, entry);
    }
  }

  console.info(`  Found ${foundUrls.length} R2 URL references across source files`);
  console.info(`  ${uniqueUrls.size} unique URLs to validate`);
  console.info('');

  if (uniqueUrls.size === 0) {
    console.info('No R2 CDN URLs found. Nothing to validate.');
    checkCspApiSync();
    return;
  }

  // Phase 2: Validate each unique URL
  console.info(`Validating URLs with ${DELAY_MS}ms rate limiting...`);
  console.info('');

  const results: ValidationResult[] = [];
  const entries = Array.from(uniqueUrls.values());

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;

    const result = await validateUrl(entry);
    results.push(result);

    // Progress indicator every 10 URLs
    if ((i + 1) % 10 === 0 || i === entries.length - 1) {
      const broken = results.filter((r) => r.status !== 'ok').length;
      console.info(`  Progress: ${i + 1}/${entries.length} -- Broken so far: ${broken}`);
    }

    // Rate limiting delay (skip on last item)
    if (i < entries.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Phase 3: Report results
  console.info('');
  console.info('Results');
  console.info('-'.repeat(40));

  const broken = results.filter((r) => r.status !== 'ok');
  const valid = results.filter((r) => r.status === 'ok');

  console.info(`  Valid:       ${valid.length}`);
  console.info(`  Broken:      ${broken.length}`);
  console.info(`  Total:       ${results.length}`);

  if (broken.length > 0) {
    console.info('');
    console.info('Broken URLs:');
    for (const result of broken) {
      const label = result.status === 'broken' ? 'BROKEN' : 'UNREACHABLE';
      const detail = result.httpStatus ? `HTTP ${result.httpStatus}` : (result.error ?? 'Unknown');
      console.error(`  ${label}: ${result.url}`);
      console.error(`    File: ${result.file}:${result.line}`);
      console.error(`    Error: ${detail}`);
      console.error('');
    }

    // List all files referencing broken URLs
    console.info('All references to broken URLs:');
    for (const brokenResult of broken) {
      const references = foundUrls.filter((u) => u.url === brokenResult.url);
      for (const ref of references) {
        console.error(`  ${ref.file}:${ref.line} -- ${ref.url}`);
      }
    }
  }

  // Phase 4: CSP/API URL sync check
  checkCspApiSync();

  // Timing
  const elapsedMs = Date.now() - startTime;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  console.info(`Completed in ${elapsedSec}s`);

  // Exit with error code if any URLs are broken
  if (broken.length > 0) {
    console.info('');
    console.error(`FAIL: ${broken.length} broken CDN URL(s) detected.`);
    process.exit(1);
  }

  console.info('');
  console.info('PASS: All CDN URLs are reachable.');
}

main().catch((error: unknown) => {
  console.error('Script failed:', error);
  process.exit(1);
});
