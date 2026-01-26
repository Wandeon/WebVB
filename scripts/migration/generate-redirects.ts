/**
 * Generate Cloudflare Pages Redirects
 * Sprint 4.3: Migration Scripts
 *
 * Generates _redirects file for Cloudflare Pages from WordPress URL mappings.
 * Redirects old WordPress URLs to new site URLs with 301 permanent redirects.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Paths
const scriptDir = dirname(new URL(import.meta.url).pathname);
const urlMapPath = join(scriptDir, 'output', 'url-map.json');
const outputDir = join(scriptDir, '..', '..', 'apps', 'web', 'public');
const outputPath = join(outputDir, '_redirects');

console.log('='.repeat(60));
console.log('Generating Cloudflare Pages Redirects');
console.log('='.repeat(60));

// Load URL map
console.log(`\nLoading URL map from: ${urlMapPath}`);
const urlMap: Record<string, string> = JSON.parse(readFileSync(urlMapPath, 'utf-8'));

console.log(`Found ${Object.keys(urlMap).length} URL mappings`);

// Generate redirect rules
const redirectLines: string[] = [
  '# WordPress URL Redirects',
  '# Generated automatically from url-map.json',
  '# Format: /old-path /new-path 301',
  '',
];

let redirectCount = 0;
let skippedCount = 0;

for (const [oldUrl, newPath] of Object.entries(urlMap)) {
  // Extract path from old URL (remove domain)
  let oldPath: string;
  try {
    const url = new URL(oldUrl);
    oldPath = url.pathname;
  } catch {
    // If not a valid URL, use as-is (shouldn't happen based on data)
    oldPath = oldUrl;
  }

  // Skip homepage redirect (/ to /pocetna would cause redirect loop)
  if (oldPath === '/') {
    skippedCount++;
    continue;
  }

  // Remove trailing slash from old path for consistent matching
  // Cloudflare Pages handles trailing slashes separately
  const normalizedOldPath = oldPath.endsWith('/') ? oldPath.slice(0, -1) : oldPath;

  // Skip empty paths
  if (!normalizedOldPath || normalizedOldPath === '') {
    skippedCount++;
    continue;
  }

  // Skip if old path and new path are the same (no redirect needed)
  if (normalizedOldPath === newPath) {
    skippedCount++;
    continue;
  }

  // Add redirect rule
  redirectLines.push(`${normalizedOldPath} ${newPath} 301`);
  redirectCount++;
}

// Also add trailing slash variants for SEO consistency
// (Cloudflare Pages will match either with or without trailing slash)

// Add a note about trailing slashes
redirectLines.push('');
redirectLines.push('# Note: Cloudflare Pages handles trailing slashes automatically');
redirectLines.push(`# Total redirects: ${redirectCount}`);

// Ensure output directory exists
try {
  mkdirSync(outputDir, { recursive: true });
  console.log(`\nCreated directory: ${outputDir}`);
} catch {
  // Directory exists
}

// Write redirects file
const content = redirectLines.join('\n') + '\n';
writeFileSync(outputPath, content);

console.log(`\nWritten ${redirectCount} redirects to: ${outputPath}`);
console.log(`Skipped ${skippedCount} entries (same path or homepage)`);

// Show sample of generated redirects
console.log('\nSample redirects:');
const sampleLines = redirectLines.filter(line => line.startsWith('/') && !line.startsWith('#')).slice(0, 10);
for (const line of sampleLines) {
  console.log(`  ${line}`);
}
if (redirectCount > 10) {
  console.log(`  ... and ${redirectCount - 10} more`);
}

console.log('\n' + '='.repeat(60));
console.log('Redirect generation complete!');
console.log('='.repeat(60));
