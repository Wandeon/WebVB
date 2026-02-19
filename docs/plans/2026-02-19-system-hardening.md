# System Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 74 GitHub issues (#92-#165) found during the deep system investigation -- security, data integrity, reliability, and robustness improvements across admin API, database, AI pipeline, auto-rebuild, and static site.

**Architecture:** Issues are grouped into 20 tasks by subsystem and dependency. Tasks 1-4 are security-critical (do first). Tasks 5-12 fix data integrity and race conditions. Tasks 13-17 harden the AI pipeline and auto-rebuild. Tasks 18-20 fix static site and SEO. Each task modifies a small cluster of related files, includes tests, and gets its own commit.

**Tech Stack:** TypeScript, Next.js 15 (App Router), Prisma ORM, PostgreSQL, Vitest, Zod, pino logger, Cloudflare R2, Caddy reverse proxy, shell scripts (bash)

**Test command:** `pnpm --filter @repo/admin test` (admin), `pnpm --filter @repo/database test` (database), `pnpm type-check` (all)

---

## Task 1: Security -- Upload ownership & UUID validation (#96, #98, #99, #100)

**Closes:** #96, #98, #99, #100

**Files:**
- Modify: `apps/admin/app/api/upload/route.ts` (DELETE handler, ~lines 85-113)
- Modify: `apps/admin/app/api/announcements/[id]/publish/route.ts` (~lines 1-125)
- Modify: `apps/admin/app/api/galleries/[id]/images/[imageId]/route.ts` (~lines 1-167)
- Modify: `apps/admin/app/api/ai/queue/[id]/route.ts` (~lines 1-77)
- Test: `apps/admin/app/api/upload/route.test.ts` (create if missing)
- Test: existing test files for the above routes

**What to do:**

### #96 -- Upload DELETE: Add R2 key ownership check
The DELETE handler in `upload/route.ts` accepts a `key` parameter and deletes from R2 without verifying the authenticated user owns the file. Fix:
1. Add UUID format validation on the `key` parameter (extract UUID from the R2 path pattern `uploads/{uuid}/variant.webp`)
2. Before deleting, query the database to verify the key belongs to a resource the user has access to. Since images are stored across multiple tables (GalleryImage, Post featuredImage, etc.), the pragmatic fix is to restrict DELETE to admin role only:
```typescript
const authResult = await requireAuth(request, { requireAdmin: true });
```
3. Add `createAuditLog()` call after successful deletion

### #98 -- Announcement publish/unpublish: Add `parseUuidParam()`
In `announcements/[id]/publish/route.ts`, both POST and DELETE handlers access `params.id` without UUID validation. Add at the top of each handler:
```typescript
const id = parseUuidParam(await params).id;
if (!id) {
  return apiError(ErrorCodes.VALIDATION_ERROR, 'Nevažeći ID', 400);
}
```
Import `parseUuidParam` from `@/lib/api-utils` (check existing pattern from other routes like `posts/[id]/route.ts`).

### #99 -- Gallery image: Add `parseUuidParam()` for both `id` and `imageId`
In `galleries/[id]/images/[imageId]/route.ts`, neither param is validated. Add validation for both:
```typescript
const { id } = parseUuidParam(await params, 'id');
const { imageId } = parseUuidParam(await params, 'imageId');
```
If `parseUuidParam` doesn't support custom field names, validate manually with a UUID regex.

### #100 -- AI queue job ID: Add UUID validation
In `ai/queue/[id]/route.ts`, validate the `id` param in both GET and DELETE:
```typescript
const id = parseUuidParam(await params).id;
```

**Tests:**
- For each route, add a test case sending a non-UUID id (e.g., `'not-a-uuid'` or `'../../../etc/passwd'`) and assert 400 response
- For upload DELETE, test that non-admin users get 403

**Commit:** `fix(security): add UUID validation and upload ownership checks (#96, #98, #99, #100)`

---

## Task 2: Security -- Auth scoping & access control (#113, #117, #123, #158)

**Closes:** #113, #117, #123, #158

**Files:**
- Modify: `apps/admin/app/api/push/unsubscribe/route.ts` (~94 lines)
- Modify: `apps/admin/app/api/ai/queue/route.ts` (GET handler, ~156 lines)
- Modify: `apps/admin/app/api/ai/queue/[id]/route.ts` (GET/DELETE handlers)
- Modify: `apps/admin/app/api/newsletter/draft/route.ts` (PUT/DELETE handlers, ~91 lines)
- Modify: `packages/database/src/repositories/push-subscriptions.ts` (verifyOwnership, ~line 78-97)
- Modify: `packages/database/src/repositories/ai-queue.ts` (findAll, findById)

**What to do:**

### #113 -- Push unsubscribe: Require ownership proof
The POST handler only requires `endpoint` URL to deactivate a subscription. Add ownership verification by requiring `p256dh` and `auth` fields (same as the DELETE handler in `push/route.ts`):
```typescript
const { endpoint, keys } = body;
if (!keys?.p256dh || !keys?.auth) {
  return apiError(ErrorCodes.VALIDATION_ERROR, 'Potrebni su ključevi za verifikaciju', 400);
}
// Use verifyOwnership before deactivating
const isOwner = await pushSubscriptionsRepository.verifyOwnership(endpoint, keys.p256dh, keys.auth);
if (!isOwner) {
  return apiError(ErrorCodes.FORBIDDEN, 'Neovlašteni pristup', 403);
}
```

### #117 -- AI queue: Scope to current user
In `ai/queue/route.ts` GET handler, add `userId` filter so users only see their own jobs:
```typescript
const result = await aiQueueRepository.findAll({
  ...queryParams,
  userId: context.userId, // Add this filter
});
```
Update `aiQueueRepository.findAll()` in the database package to accept and apply `userId` filter:
```typescript
where: {
  ...(options.userId && { createdBy: options.userId }),
  ...(options.status && { status: options.status }),
}
```
Same for `findById` -- add ownership check:
```typescript
const job = await aiQueueRepository.findById(id);
if (job && job.createdBy !== context.userId && context.role !== 'admin') {
  return apiError(ErrorCodes.FORBIDDEN, 'Nemate pristup ovom zadatku', 403);
}
```
Admin users can see all jobs.

### #123 -- Newsletter draft: Require admin for mutations
In `newsletter/draft/route.ts`, add `requireAdmin: true` to PUT and DELETE handlers:
```typescript
// PUT handler
const authResult = await requireAuth(request, { requireAdmin: true });

// DELETE handler
const authResult = await requireAuth(request, { requireAdmin: true });
```
GET can remain staff-accessible (reading is fine).

### #158 -- Push verifyOwnership: Use constant-time comparison
In `push-subscriptions.ts`, replace `===` with `crypto.timingSafeEqual`:
```typescript
import { timingSafeEqual } from 'node:crypto';

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// In verifyOwnership:
return constantTimeEquals(subscription.p256dh, p256dh) && constantTimeEquals(subscription.auth, auth);
```

**Tests:**
- AI queue: test that staff user cannot see admin's jobs
- Newsletter draft: test that staff gets 403 on PUT/DELETE
- Push unsubscribe: test that missing keys returns 400

**Commit:** `fix(security): scope AI queue by user, require admin for newsletter draft, verify push ownership (#113, #117, #123, #158)`

---

## Task 3: Rate limiting & error handling (#104, #107, #109)

**Closes:** #104, #107, #109

**Files:**
- Modify: `apps/admin/app/api/public/search/route.ts` (~228 lines)
- Modify: `apps/admin/app/api/public/posts/route.ts` (~73 lines)
- Modify: `apps/admin/app/api/newsletter/send/route.ts` (~183 lines)

**What to do:**

### #107 -- Public search: Add rate limiting
Look at how other public endpoints implement rate limiting (e.g., `push/unsubscribe/route.ts` uses an IP-based rate limiter). Apply the same pattern:
```typescript
import { rateLimit } from '@/lib/rate-limit';

const searchLimiter = rateLimit({ windowMs: 60_000, max: 30 }); // 30 req/min

export async function GET(request: NextRequest) {
  const limited = searchLimiter(request);
  if (limited) return limited;
  // ... existing code
}
```

### #109 -- Public posts: Add rate limiting
Same pattern as search but more permissive (this is the main listing page):
```typescript
const postsLimiter = rateLimit({ windowMs: 60_000, max: 60 }); // 60 req/min
```

### #104 -- Newsletter send: Move `requireAuth` inside try/catch
Currently `requireAuth()` is called before the try/catch block. If it throws (DB error during session lookup), the error is unhandled. Move it inside:
```typescript
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });
    if ('response' in authResult) return authResult.response;
    // ... rest of handler
  } catch (error) {
    newsletterLogger.error({ error }, 'Newsletter send failed');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška pri slanju newslettera', 500);
  }
}
```

**Tests:**
- For rate limiting: not easily unit-testable (depends on request IP), document in comments
- For newsletter: test that DB error during auth returns 500 (not unhandled crash)

**Commit:** `fix: add rate limiting to public endpoints, fix newsletter error handling (#104, #107, #109)`

---

## Task 4: Audit log gaps & orphaned resources (#103, #138, #145)

**Closes:** #103, #138, #145

**Files:**
- Modify: `apps/admin/app/api/galleries/[id]/images/[imageId]/route.ts` (PUT handler)
- Modify: `apps/admin/app/api/upload/route.ts` (POST/DELETE)
- Modify: `apps/admin/app/api/announcements/[id]/route.ts` (DELETE handler, ~lines 157-207)
- Modify: `apps/admin/app/api/posts/[id]/route.ts` (DELETE handler, ~lines 197-229)
- Modify: `packages/database/src/search/indexer.ts` (add removeEmbeddings)

**What to do:**

### #103 -- Add audit logs to missing mutations
Add `createAuditLog()` calls to:
1. Gallery image PUT (caption update): `action: 'update', entityType: 'gallery_image'`
2. Gallery image DELETE: `action: 'delete', entityType: 'gallery_image'`
3. Upload DELETE: `action: 'delete', entityType: 'upload'`

Follow existing pattern from posts/announcements routes:
```typescript
await createAuditLog({
  userId: context.userId,
  action: 'update',
  entityType: 'gallery_image',
  entityId: imageId,
  changes: { before: { caption: existing.caption }, after: { caption: newCaption } },
  ...getAuditMetadata(request),
});
```

### #138 -- Announcement DELETE: Clean R2 attachments
In `announcements/[id]/route.ts` DELETE handler, before deleting the announcement, fetch its attachments and delete their R2 files. Follow the gallery deletion pattern:
```typescript
// Before DB delete
const announcement = await announcementsRepository.findById(id);
if (announcement?.attachments?.length) {
  const { deleteFromR2 } = await import('@/lib/r2');
  await Promise.allSettled(
    announcement.attachments.map(att => {
      const key = new URL(att.fileUrl).pathname.slice(1);
      return deleteFromR2(key);
    })
  );
}
// Then DB delete (cascade handles attachment records)
```

### #145 -- Post DELETE: Clean Embedding records
In `posts/[id]/route.ts` DELETE handler, after `removeFromIndex('post', id)`, also delete embeddings:
```typescript
await removeFromIndex('post', id);
// Also clean up embeddings
await db.embedding.deleteMany({
  where: { sourceType: 'post', sourceId: id },
});
```
Or add a `removeEmbeddings(sourceType, sourceId)` function to `indexer.ts` and call it.

**Commit:** `fix: add missing audit logs, clean R2 on announcement delete, clean embeddings on post delete (#103, #138, #145)`

---

## Task 5: AI Queue race conditions (#108, #136, #153, #159)

**Closes:** #108, #136, #153, #159

**Files:**
- Modify: `packages/database/src/repositories/ai-queue.ts` (~449 lines)
- Test: `packages/database/src/repositories/__tests__/ai-queue.test.ts` (create if missing)

**What to do:**

### #108 -- Atomic claim with single updateMany
Replace the two-step findFirst + updateMany with a single atomic operation:
```typescript
async claimNext(workerId: string, leaseMs: number = 300_000): Promise<AiQueueJob | null> {
  const leaseExpiresAt = new Date(Date.now() + leaseMs);

  // Single atomic claim -- find + update in one query
  const jobs = await db.$queryRaw<AiQueueJob[]>`
    UPDATE ai_queue
    SET status = 'processing',
        worker_id = ${workerId},
        lease_expires_at = ${leaseExpiresAt},
        started_at = COALESCE(started_at, NOW()),
        attempts = attempts + 1
    WHERE id = (
      SELECT id FROM ai_queue
      WHERE (status = 'pending' OR (status = 'processing' AND lease_expires_at < NOW()))
        AND attempts < ${MAX_ATTEMPTS}
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `;
  return jobs[0] ?? null;
}
```
This uses `FOR UPDATE SKIP LOCKED` to prevent double-claiming entirely. Increment attempts only on claim (reflecting actual processing attempts).

### #136 -- Fix off-by-one in dead-letter guard
In `claimNext`, the guard uses `attempts >= maxAttempts` but `processJob` uses `attempts > maxAttempts`. Standardize: use `attempts >= maxAttempts` everywhere. With the atomic query above, this is handled by `AND attempts < ${MAX_ATTEMPTS}`.

### #153 -- Atomic cancel
Replace the read-then-update cancel with a single atomic update:
```typescript
async cancel(id: string): Promise<AiQueueJob | null> {
  const result = await db.aiQueue.updateMany({
    where: {
      id,
      status: { in: ['pending'] }, // Only cancel pending jobs
    },
    data: {
      status: 'cancelled',
      completedAt: new Date(),
    },
  });
  if (result.count === 0) return null;
  return db.aiQueue.findUnique({ where: { id } });
}
```

### #159 -- Allow re-submission after failure
In the idempotency check, exclude failed/dead_letter jobs:
```typescript
async findByIdempotencyKey(key: string, requestType: string): Promise<AiQueueJob | null> {
  return db.aiQueue.findFirst({
    where: {
      requestType,
      inputData: { path: ['idempotencyKey'], equals: key },
      status: { notIn: ['failed', 'dead_letter', 'cancelled'] }, // Allow retry after failure
    },
  });
}
```

**Tests:**
- Test that `cancel()` returns null when job is already processing
- Test that idempotency allows re-submission after failure
- Test atomic claim with mock raw query

**Commit:** `fix(ai-queue): atomic claim, consistent dead-letter guard, atomic cancel, allow failed retry (#108, #136, #153, #159)`

---

## Task 6: AI Queue worker robustness (#94, #141, #154)

**Closes:** #94, #141, #154

**Files:**
- Modify: `apps/admin/lib/ai/queue-worker.ts` (~548 lines)

**What to do:**

### #94 -- Extend lease during long pipeline jobs
Add a lease renewal mechanism. Before each pipeline stage, extend the lease:
```typescript
async function renewLease(jobId: string, workerId: string, leaseMs: number = 300_000): Promise<void> {
  await aiQueueRepository.extendLease(jobId, workerId, leaseMs);
}
```
Add `extendLease` to the ai-queue repository:
```typescript
async extendLease(jobId: string, workerId: string, leaseMs: number): Promise<void> {
  await db.aiQueue.updateMany({
    where: { id: jobId, workerId, status: 'processing' },
    data: { leaseExpiresAt: new Date(Date.now() + leaseMs) },
  });
}
```
Call `renewLease()` before each pipeline stage (generate, review, rewrite, polish).

### #141 -- Circuit breaker / backpressure
Add a simple circuit breaker to the worker:
```typescript
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 5;
const BACKOFF_BASE_MS = 30_000; // 30 seconds

function getPollingInterval(): number {
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    // Exponential backoff: 30s, 60s, 120s, 240s, max 5 min
    const backoff = Math.min(BACKOFF_BASE_MS * Math.pow(2, consecutiveFailures - MAX_CONSECUTIVE_FAILURES), 300_000);
    return backoff;
  }
  return POLL_INTERVAL_MS;
}
```
Reset `consecutiveFailures = 0` on successful job completion. Increment on failure. Log when entering/leaving backoff.

### #154 -- Increase shutdown timeout and check flag during pipeline
Change shutdown timeout from 10s to 120s (2 minutes):
```typescript
const SHUTDOWN_TIMEOUT_MS = 120_000;
```
Add `shutdownRequested` check before each pipeline stage:
```typescript
// In pipeline processing
if (shutdownRequested) {
  throw new Error('Shutdown requested, aborting pipeline');
}
```

**Commit:** `fix(ai-worker): lease renewal, circuit breaker backpressure, graceful shutdown (#94, #141, #154)`

---

## Task 7: AI Pipeline parsing & validation (#92, #147, #161, #164)

**Closes:** #92, #147, #161, #164

**Files:**
- Modify: `apps/admin/lib/ai/pipeline.ts` (~350 lines)
- Modify: `apps/admin/lib/ai/prompts/review.ts` (~104 lines)
- Modify: `apps/admin/lib/ai/prompts/banned-words.ts` (~138 lines)
- Modify: `apps/admin/lib/ai/queue-worker.ts` (JSON extraction)
- Test: `apps/admin/lib/ai/__tests__/pipeline.test.ts`
- Test: `apps/admin/lib/ai/__tests__/banned-words.test.ts` (create if missing)

**What to do:**

### #92 -- Fix greedy JSON regex
Replace `\{[\s\S]*\}` with a balanced-brace parser:
```typescript
function extractJson(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return null; // Unbalanced braces
}
```
Apply this in: `pipeline.ts` (review/rewrite parsing), `review.ts` (parseReviewResponse), `queue-worker.ts` (result parsing). Replace all occurrences of the greedy regex.

### #147 -- Validate review issues array structure
In `parseReviewResponse()` in `review.ts`, validate each issue object:
```typescript
const validIssueTypes = new Set(['slop_word', 'slop_phrase', 'sentence_too_long', 'wall_of_text', 'missing_concrete', 'invented_fact', 'grammar']);

function isValidIssue(issue: unknown): issue is ReviewIssue {
  if (!issue || typeof issue !== 'object') return false;
  const obj = issue as Record<string, unknown>;
  return (
    typeof obj.type === 'string' && validIssueTypes.has(obj.type) &&
    typeof obj.location === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.fix === 'string'
  );
}

// In parseReviewResponse:
const validIssues = (parsed.issues as unknown[]).filter(isValidIssue);
// Cap at 20 issues max to prevent abuse
const cappedIssues = validIssues.slice(0, 20);
```

### #161 -- Fix \b word boundary for Croatian diacritics
Replace `\b` with Unicode-aware word boundaries using lookbehind/lookahead:
```typescript
function createWordBoundaryRegex(word: string): RegExp {
  // Use negative lookbehind/lookahead for word characters including diacritics
  const boundary = String.raw`(?<![a-zA-ZčćšžđČĆŠŽĐ])`;
  const boundaryEnd = String.raw`(?![a-zA-ZčćšžđČĆŠŽĐ])`;
  return new RegExp(`${boundary}${escapeRegex(word)}${boundaryEnd}`, 'gi');
}
```
Apply in `findBannedWords()` in `banned-words.ts`.

### #164 -- Actually return PipelineFailure
In `runArticlePipeline()`, the function is typed to return `PipelineResult | PipelineFailure` but never returns the failure type. Fix:
```typescript
// On generation failure:
if (!generatedArticle) {
  return {
    success: false,
    stage: 'generate',
    reason: 'LLM generation returned empty response',
    rawSample: undefined,
  } satisfies PipelineFailure;
}

// On parse failure:
if (parseError && !article) {
  return {
    success: false,
    stage: currentStage,
    reason: parseError,
    rawSample: rawResponse?.slice(0, 500),
  } satisfies PipelineFailure;
}
```

**Tests:**
- Test balanced brace JSON extractor with nested braces, multiple objects, and commentary
- Test issue validation filters out malformed issues
- Test Croatian word boundary: `štoviše` should not match inside `ništoviše` (hypothetical)
- Test PipelineFailure is returned on generation failure

**Commit:** `fix(ai-pipeline): balanced JSON parser, validate issues, Croatian word boundaries, return PipelineFailure (#92, #147, #161, #164)`

---

## Task 8: AI Pipeline flow & config (#101, #105, #112, #118, #125, #129, #151)

**Closes:** #101, #105, #112, #118, #125, #129, #151

**Files:**
- Modify: `apps/admin/lib/ai/pipeline.ts`
- Modify: `apps/admin/lib/ai/queue-worker.ts`
- Modify: `apps/admin/lib/ai/ollama-cloud.ts`
- Modify: `apps/admin/app/api/ai/generate-post/route.ts`
- Test: `apps/admin/lib/ai/__tests__/pipeline.test.ts`

**What to do:**

### #101 -- Re-check banned words after rewrite
After each rewrite, run banned word check on the new article:
```typescript
// After rewrite stage
const postRewriteBanned = findAllBanned(rewrittenArticle.content);
if (postRewriteBanned.length > 0) {
  // Add to issues for next rewrite attempt
  allIssues.push(...postRewriteBanned.map(b => ({
    type: 'slop_word' as const,
    location: 'content',
    text: b,
    fix: `Zamijeni "${b}" neutralnim izrazom`,
  })));
}
```

### #105 -- Re-check after polish
After polish stage, run banned word + basic validation:
```typescript
const postPolishBanned = findAllBanned(polishedArticle.content);
if (postPolishBanned.length > 0) {
  pipelineLogger.warn({ bannedWords: postPolishBanned }, 'Polish introduced banned words, reverting');
  // Use pre-polish version instead
  return { ...result, article: prePolishArticle };
}
```

### #112 -- Guard against large LLM responses
In `ollama-cloud.ts`, add response size validation:
```typescript
const MAX_RESPONSE_SIZE = 100_000; // 100KB
const responseText = await response.text();
if (responseText.length > MAX_RESPONSE_SIZE) {
  throw new AiError('RESPONSE_TOO_LARGE', `Response exceeded ${MAX_RESPONSE_SIZE} bytes`);
}
const data = JSON.parse(responseText) as OllamaGenerateResponse;
```

### #118 -- Use STAGE_TEMPERATURE for initial generation
In `queue-worker.ts`, pass the temperature when calling generate:
```typescript
import { STAGE_TEMPERATURE } from '@/lib/ai/pipeline';

const response = await generate({
  model,
  system: GENERATE_SYSTEM_PROMPT,
  prompt: userPrompt,
  temperature: STAGE_TEMPERATURE.generate, // 0.3
});
```

### #125 -- Add similarity check for few-shot examples
After generation, check if output is too similar to any example:
```typescript
import { FEW_SHOT_EXAMPLES } from '@/lib/ai/prompts/generate';

function isTooSimilarToExample(content: string): boolean {
  for (const example of FEW_SHOT_EXAMPLES) {
    // Simple overlap check: if >60% of sentences match
    const exampleSentences = example.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const contentSentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    let matches = 0;
    for (const cs of contentSentences) {
      if (exampleSentences.some(es => cs.trim().includes(es.trim()) || es.trim().includes(cs.trim()))) {
        matches++;
      }
    }
    if (contentSentences.length > 0 && matches / contentSentences.length > 0.5) {
      return true;
    }
  }
  return false;
}
```
If too similar, log a warning and add to issues.

### #129 -- Use Retry-After header for backoff
In `ollama-cloud.ts` `withRetry()`, check the error's `retryAfter` field:
```typescript
if (error instanceof AiError && error.retryAfter) {
  const waitMs = error.retryAfter * 1000;
  await sleep(Math.min(waitMs, 120_000)); // Cap at 2 minutes
} else {
  await sleep(baseDelay * Math.pow(2, attempt));
}
```

### #151 -- Limit document text before sanitization
In `generate-post/route.ts`, truncate document text before running regex sanitization:
```typescript
const MAX_DOCUMENT_TEXT_LENGTH = 50_000; // 50K chars
let documentText = rawText;
if (documentText.length > MAX_DOCUMENT_TEXT_LENGTH) {
  documentText = documentText.slice(0, MAX_DOCUMENT_TEXT_LENGTH);
  pipelineLogger.warn({ originalLength: rawText.length }, 'Document text truncated before sanitization');
}
// Then run sanitization on truncated text
```

**Commit:** `fix(ai-pipeline): post-rewrite/polish checks, response size guard, temperature config, similarity check, retry-after, doc truncation (#101, #105, #112, #118, #125, #129, #151)`

---

## Task 9: Slug generation hardening (#114, #120)

**Closes:** #114, #120

**Files:**
- Modify: `apps/admin/app/api/posts/route.ts` (POST, ~lines 100-107)
- Modify: `apps/admin/app/api/galleries/route.ts` (POST)
- Modify: `apps/admin/app/api/announcements/route.ts` (POST, if exists) or `[id]/route.ts` (PUT)
- Modify: `apps/admin/app/api/pages/route.ts` (POST)

**What to do:**

### #120 -- Cap the slug uniqueness loop
Add a maximum iteration count (10 is plenty):
```typescript
const MAX_SLUG_ATTEMPTS = 10;
let slug = generateSlug(title);
let suffix = 1;
while (await repository.slugExists(slug)) {
  if (suffix > MAX_SLUG_ATTEMPTS) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Ne mogu generirati jedinstveni slug', 500);
  }
  slug = `${generateSlug(title)}-${suffix}`;
  suffix++;
}
```
Apply to all 4 routes that have slug generation loops.

### #114 -- Handle unique constraint violation gracefully
Wrap the create call in a retry that catches Prisma P2002 (unique constraint):
```typescript
import { Prisma } from '@prisma/client';

try {
  const created = await repository.create({ ...data, slug });
  // success
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    // Slug collision from concurrent request -- retry with timestamp suffix
    slug = `${generateSlug(title)}-${Date.now().toString(36).slice(-4)}`;
    const created = await repository.create({ ...data, slug });
    // success with fallback slug
  } else {
    throw error;
  }
}
```

**Commit:** `fix: cap slug generation loop, handle concurrent slug collisions (#114, #120)`

---

## Task 10: Data integrity -- Transactions & cascades (#121, #131, #135, #156)

**Closes:** #121, #131, #135, #156

**Files:**
- Modify: `apps/admin/app/api/posts/route.ts` (POST)
- Modify: `apps/admin/app/api/posts/[id]/route.ts` (PUT, DELETE)
- Modify: `apps/admin/app/api/pages/[id]/route.ts` (DELETE handler)
- Modify: `packages/database/src/repositories/newsletter-draft.ts` (~146 lines)
- Modify: `packages/database/src/repositories/galleries.ts` (addImages, ~lines 171-193)
- Modify: `packages/database/prisma/schema.prisma` (Page model)
- Modify: `packages/database/src/repositories/pages.ts` (delete)

**What to do:**

### #121 -- Wrap post create + index in transaction-like handling
Since `indexPost()` uses raw SQL, true Prisma transactions won't help. Instead, make indexing best-effort with error recovery:
```typescript
const post = await postsRepository.create(createData);
try {
  await indexPost(post);
} catch (indexError) {
  postsLogger.error({ postId: post.id, error: indexError }, 'Failed to index post, will retry on next update');
  // Don't fail the create -- post exists, just not indexed yet
}
```
Apply same pattern to update and delete paths. For delete, catch index removal errors:
```typescript
try {
  await removeFromIndex('post', id);
  await db.embedding.deleteMany({ where: { sourceType: 'post', sourceId: id } });
} catch (indexError) {
  postsLogger.error({ postId: id, error: indexError }, 'Failed to clean search index');
}
await postsRepository.delete(id);
```

### #131 -- Page deletion: Reassign children first
In `pages/[id]/route.ts` DELETE handler, before deleting, reassign children to the page's parent (or null for root):
```typescript
const page = await pagesRepository.findById(id);
if (!page) return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);

// Reassign children to this page's parent (or root)
if (page.children && page.children.length > 0) {
  await db.page.updateMany({
    where: { parentId: id },
    data: { parentId: page.parentId ?? null },
  });
}
// Now safe to delete
await pagesRepository.delete(id);
```

### #135 -- Newsletter draft: Atomic JSON array update
Replace read-modify-write with raw SQL for atomic update in `addItem()` and `removeItem()`:
```typescript
async addItem(type: string, id: string): Promise<void> {
  const item = { type, id, addedAt: new Date().toISOString() };
  // Atomic append using jsonb_insert or || operator
  await db.$executeRaw`
    UPDATE newsletter_draft
    SET items = CASE
      WHEN items @> ${JSON.stringify([{ type, id }])}::jsonb THEN items
      ELSE items || ${JSON.stringify([item])}::jsonb
    END
    WHERE id = 'singleton'
  `;
}

async removeItem(type: string, id: string): Promise<void> {
  // Atomic remove
  await db.$executeRaw`
    UPDATE newsletter_draft
    SET items = (
      SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
      FROM jsonb_array_elements(items) elem
      WHERE NOT (elem->>'type' = ${type} AND elem->>'id' = ${id})
    )
    WHERE id = 'singleton'
  `;
}
```

### #156 -- Gallery addImages: Read max sortOrder inside transaction
In `galleries.ts` `addImages()`, move the max sortOrder query inside the transaction:
```typescript
async addImages(galleryId: string, images: ImageInput[]): Promise<void> {
  await db.$transaction(async (tx) => {
    // Get max sortOrder inside transaction for consistency
    const maxResult = await tx.galleryImage.aggregate({
      where: { galleryId },
      _max: { sortOrder: true },
    });
    const startOrder = (maxResult._max.sortOrder ?? -1) + 1;

    await tx.galleryImage.createMany({
      data: images.map((img, i) => ({
        ...img,
        galleryId,
        sortOrder: startOrder + i,
      })),
    });
  });
}
```

**Commit:** `fix(data): best-effort indexing, reassign page children on delete, atomic draft updates, gallery sortOrder in tx (#121, #131, #135, #156)`

---

## Task 11: Publish race condition & pagination (#111, #143)

**Closes:** #111, #143

**Files:**
- Modify: `apps/admin/app/api/announcements/[id]/publish/route.ts`
- Modify: `packages/database/src/repositories/posts.ts` (findAll)
- Modify: `packages/database/src/repositories/events.ts` (findAll)
- Modify: `packages/database/src/repositories/galleries.ts` (findAll)
- Modify: `packages/database/src/repositories/documents.ts` (findAll)
- Modify: `packages/database/src/repositories/announcements.ts` (findAll)
- Modify: `packages/database/src/repositories/ai-queue.ts` (findAll)
- Modify: `packages/database/src/repositories/contact-messages.ts` (findAll)
- Modify: `packages/database/src/repositories/problem-reports.ts` (findAll)

**What to do:**

### #111 -- Atomic publish/unpublish
Replace check-then-update with conditional update:
```typescript
// POST (publish)
const result = await db.announcement.updateMany({
  where: { id, publishedAt: null }, // Only publish if currently unpublished
  data: { publishedAt: new Date() },
});
if (result.count === 0) {
  return apiError(ErrorCodes.VALIDATION_ERROR, 'Obavijest je već objavljena ili ne postoji', 400);
}

// DELETE (unpublish)
const result = await db.announcement.updateMany({
  where: { id, publishedAt: { not: null } }, // Only unpublish if currently published
  data: { publishedAt: null },
});
if (result.count === 0) {
  return apiError(ErrorCodes.VALIDATION_ERROR, 'Obavijest nije objavljena ili ne postoji', 400);
}
```

### #143 -- Clamp page number in admin findAll
In each repository's `findAll()`, add page clamping (same as the public `findPublished` methods):
```typescript
const { page, limit } = normalizePagination(options.page, options.limit);
const total = await db.post.count({ where });
const totalPages = Math.ceil(total / limit);
const clampedPage = Math.min(page, Math.max(totalPages, 1)); // Clamp to valid range
const skip = (clampedPage - 1) * limit;
```
Apply to all 8 repositories listed above.

**Commit:** `fix: atomic publish/unpublish, clamp admin pagination to valid range (#111, #143)`

---

## Task 12: Database config & timezone fixes (#127, #150, #162)

**Closes:** #127, #150, #162

**Files:**
- Modify: `packages/database/src/repositories/events.ts` (getZagrebStartOfDay, ~lines 369-374)
- Modify: `packages/database/src/client.ts` (~42 lines)
- Modify: `packages/database/prisma/schema.prisma` (Event model, optional)

**What to do:**

### #127 -- Fix getZagrebStartOfDay
Replace the buggy `toLocaleString` + `new Date()` pattern:
```typescript
function getZagrebStartOfDay(): Date {
  // Get current time in Europe/Zagreb
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // YYYY-MM-DD in Zagreb timezone
  const zagrebDate = formatter.format(now);
  // Construct midnight UTC equivalent
  // Zagreb is UTC+1 (winter) or UTC+2 (summer)
  const zagrebMidnight = new Date(`${zagrebDate}T00:00:00+01:00`);
  // Handle DST: check if the date is in summer time
  const janOffset = new Date(`${zagrebDate.slice(0, 4)}-01-15T12:00:00`).toLocaleString('en-US', { timeZone: 'Europe/Zagreb', hour: 'numeric', hour12: false });
  const currentOffset = now.toLocaleString('en-US', { timeZone: 'Europe/Zagreb', hour: 'numeric', hour12: false });
  // Simpler: just use the date string to create a UTC-0 date and adjust
  return new Date(`${zagrebDate}T00:00:00.000Z`);
}
```

Actually, the simplest correct approach:
```typescript
function getZagrebStartOfDay(): Date {
  // Use Intl to get Zagreb date, construct UTC midnight for that date
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;

  // Return start of day in Zagreb timezone as UTC
  // Zagreb is CET (UTC+1) or CEST (UTC+2)
  return new Date(`${year}-${month}-${day}T00:00:00+01:00`);
}
```

Note: This still has a DST edge case. The most robust solution is to use a library, but given the existing codebase avoids date libraries, use the Intl approach and document the ~1 hour potential offset during DST transitions at midnight.

### #150 -- Add connection pool config to PrismaClient
In `client.ts`, configure the connection pool:
```typescript
export const db =
  databaseEnv
    ? globalThis.prisma ??
      new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: databaseEnv.DATABASE_URL,
          },
        },
      })
    : missingDatabaseClient;
```
And add `?connection_limit=10&pool_timeout=30` to DATABASE_URL in the deployment environment. Document this in a comment:
```typescript
// Connection pool is configured via DATABASE_URL query params:
// ?connection_limit=10&pool_timeout=30
// Default Prisma pool = 2 * num_cpus + 1 (often only 3-5 on small VPS)
```

### #162 -- Document event date timezone behavior
Add a comment to the Event model in `schema.prisma` and in the events repository documenting that `@db.Date` strips timezone info and `@db.Time()` returns epoch-based Date:
```typescript
// IMPORTANT: eventDate is PostgreSQL DATE type (no timezone).
// JS Date conversions may shift by 1 day depending on server timezone.
// Always compare using date-only strings (YYYY-MM-DD), not Date objects.
// eventTime is PostgreSQL TIME type -- returns as 1970-01-01T{HH:MM:SS}.000Z.
// To combine with eventDate, extract hours/minutes from eventTime manually.
```

**Commit:** `fix(db): fix Zagreb timezone, document connection pool, document date timezone behavior (#127, #150, #162)`

---

## Task 13: Rebuild -- Core crash recovery (#93, #95, #97, #110, #115, #140)

**Closes:** #93, #95, #97, #110, #115, #140

**Files:**
- Modify: `apps/admin/lib/rebuild.ts` (~64 lines, will grow significantly)

**What to do:**

### #93 -- Wrap exec callback in try/finally
```typescript
exec(
  `bash ${REBUILD_SCRIPT}`,
  { timeout: 600_000, env: { ...process.env, HOME: '/home/deploy' } },
  (error, _stdout, stderr) => {
    try {
      if (error) {
        rebuildLogger.error({ error: error.message, stderr }, 'Rebuild failed');
      } else {
        rebuildLogger.info({ reason }, 'Rebuild completed successfully');
      }
    } finally {
      buildInProgress = false; // Always reset, even if logging throws

      if (pendingReasons.length > 0) {
        const next = pendingReasons.splice(0).join(', ');
        rebuildLogger.info({ reason: next }, 'Processing queued rebuild');
        startBuild(next);
      }
    }
  }
);
```

### #95 -- Persist debounce state
Write pending rebuild state to a temp file so it survives restarts:
```typescript
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const PENDING_FILE = '/tmp/webvb-rebuild-pending.json';

function persistPendingRebuild(reasons: string[]): void {
  writeFileSync(PENDING_FILE, JSON.stringify({ reasons, timestamp: Date.now() }));
}

function checkPendingRebuild(): void {
  if (!existsSync(PENDING_FILE)) return;
  try {
    const data = JSON.parse(readFileSync(PENDING_FILE, 'utf8')) as { reasons: string[]; timestamp: number };
    // Only process if written less than 30 minutes ago
    if (Date.now() - data.timestamp < 30 * 60_000) {
      rebuildLogger.info({ reasons: data.reasons }, 'Recovering pending rebuild from previous session');
      startBuild(data.reasons.join(', '));
    }
    unlinkSync(PENDING_FILE);
  } catch { /* ignore corrupt file */ }
}

// Call on module load
checkPendingRebuild();
```

### #97 -- Store array of pending reasons
Replace `pendingReason: string | null` with:
```typescript
let pendingReasons: string[] = [];

// In triggerRebuild:
if (buildInProgress) {
  pendingReasons.push(reason);
  persistPendingRebuild(pendingReasons);
  return;
}
```

### #110 -- Use blocking flock (remove -n)
This is a VPS-side change in `rebuild-web.sh`. Document in the code and create a separate script update task. For now, add a comment:
```typescript
// NOTE: rebuild-web.sh must use `flock` (blocking) not `flock -n` (non-blocking)
// to prevent builds from being silently skipped.
// See GitHub issue #110
```

### #115 -- Baseline corruption recovery
This is in `rebuild-web.sh`. Document the requirement:
```typescript
// NOTE: rebuild-web.sh should validate .web-build-filecount before comparing.
// If corrupted (not a number), regenerate from current release.
// See GitHub issue #115
```

### #140 -- Document baseline order requirement
```typescript
// NOTE: rebuild-web.sh must write baseline AFTER successful symlink swap,
// not before. See GitHub issue #140
```

**Commit:** `fix(rebuild): try/finally reset, persist pending state, collect reasons array (#93, #95, #97)`

---

## Task 14: Rebuild -- Shell script hardening (#102, #106, #124, #128, #137, #160)

**Closes:** #102, #106, #110, #115, #119, #124, #128, #137, #140, #160

**Files:**
- These are VPS-side changes to `/home/deploy/scripts/rebuild-web.sh`
- Since the shell script is on the VPS (not in the repo), create a new versioned script in the repo:
- Create: `scripts/rebuild-web.sh` (copy from VPS, apply all fixes)

**What to do:**

Create the shell script in the repo with all fixes applied. Key changes from the current script:

1. **#102** -- Retry git pull with exponential backoff (3 attempts)
2. **#106** -- Kill process group on timeout: use `exec` and `trap` for cleanup
3. **#110** -- Change `flock -n` to blocking `flock` with timeout (`flock -w 660`)
4. **#115** -- Validate baseline file: if not numeric, regenerate from current release
5. **#119** -- Add `SKIP_GATE_B=1` environment variable override for Gate B
6. **#124** -- Move cleanup to a separate step that doesn't fail the build (trap or `|| true`)
7. **#128** -- Use `rsync --delay-updates` or move completed build atomically instead of `cp -a`
8. **#137** -- Add `command -v pnpm` pre-flight check
9. **#140** -- Move baseline write to AFTER successful symlink swap
10. **#160** -- Add `pg_isready` or equivalent DB pre-flight check

```bash
#!/usr/bin/env bash
set -euo pipefail

# Pre-flight checks
command -v pnpm >/dev/null 2>&1 || { echo "ERROR: pnpm not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "ERROR: node not found"; exit 1; }

# DB pre-flight (optional, don't fail if pg_isready not available)
if command -v pg_isready >/dev/null 2>&1; then
  pg_isready -q || { echo "WARNING: Database not reachable"; }
fi

# ... rest of script with fixes applied
```

**Commit:** `fix(rebuild): hardened rebuild script with pre-flight checks, retry, cleanup isolation (#102, #106, #110, #115, #119, #124, #128, #137, #140, #160)`

---

## Task 15: Rebuild -- Smart triggers (#132, #133, #146, #149)

**Closes:** #132, #133, #146, #149

**Files:**
- Modify: `apps/admin/app/api/announcements/[id]/attachments/route.ts` (~146 lines)
- Modify: `apps/admin/app/api/events/route.ts` (POST)
- Modify: `apps/admin/app/api/events/[id]/route.ts` (PUT, DELETE)
- Modify: `apps/admin/app/api/pages/[id]/route.ts` (PUT)
- Modify: `apps/admin/lib/rebuild.ts`

**What to do:**

### #132 -- Attachment routes: Check publish state before rebuild
In `announcements/[id]/attachments/route.ts`, check if the announcement is published before triggering rebuild:
```typescript
const announcement = await announcementsRepository.findById(id);
if (announcement?.publishedAt) {
  triggerRebuild(`announcement-attachment-changed:${id}`);
}
```

### #133 -- Events: Accept always-rebuild as design choice
Events have no draft concept, so they should always trigger rebuild. Add a brief comment:
```typescript
// Events are always public -- every change triggers rebuild (no draft concept)
triggerRebuild(`event-${action}:${id}`);
```
Close #133 as "by design" with the comment.

### #146 -- Pages: Compare before rebuilding
In pages PUT handler, compare old and new content before triggering:
```typescript
const existingPage = await pagesRepository.findById(id);
// ... update logic
const updated = await pagesRepository.update(id, updateData);

// Only rebuild if visible content changed
const contentChanged =
  existingPage.title !== updated.title ||
  existingPage.content !== updated.content ||
  existingPage.parentId !== updated.parentId ||
  existingPage.menuOrder !== updated.menuOrder;

if (contentChanged) {
  triggerRebuild(`page-updated:${id}`);
}
```

### #149 -- Anti-chain: Add cooldown after build completes
In `rebuild.ts`, add a minimum cooldown between builds:
```typescript
const MIN_BUILD_COOLDOWN_MS = 60_000; // 1 minute between builds
let lastBuildCompletedAt = 0;

function startBuild(reason: string): void {
  const timeSinceLastBuild = Date.now() - lastBuildCompletedAt;
  if (timeSinceLastBuild < MIN_BUILD_COOLDOWN_MS) {
    rebuildLogger.info({ reason, cooldownRemaining: MIN_BUILD_COOLDOWN_MS - timeSinceLastBuild }, 'Cooldown active, queuing');
    pendingReasons.push(reason);
    setTimeout(() => {
      if (pendingReasons.length > 0 && !buildInProgress) {
        const next = pendingReasons.splice(0).join(', ');
        startBuild(next);
      }
    }, MIN_BUILD_COOLDOWN_MS - timeSinceLastBuild);
    return;
  }
  // ... existing build logic
}
```

**Commit:** `fix(rebuild): check publish state for attachments, compare page content, add build cooldown (#132, #133, #146, #149)`

---

## Task 16: Rebuild -- Build status visibility (#142)

**Closes:** #142

**Files:**
- Modify: `apps/admin/lib/rebuild.ts`
- Create: `apps/admin/app/api/system/build-status/route.ts`

**What to do:**

### #142 -- Expose build state via API
Add a simple API endpoint that returns the current build state:
```typescript
// apps/admin/app/api/system/build-status/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { apiSuccess } from '@/lib/api-response';
import { getBuildStatus } from '@/lib/rebuild';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, { requireAdmin: true });
  if ('response' in authResult) return authResult.response;

  return apiSuccess(getBuildStatus());
}
```

Add `getBuildStatus()` to rebuild.ts:
```typescript
interface BuildStatus {
  buildInProgress: boolean;
  pendingReasons: string[];
  lastBuildCompletedAt: number | null;
  lastBuildError: string | null;
}

let lastBuildError: string | null = null;

export function getBuildStatus(): BuildStatus {
  return {
    buildInProgress,
    pendingReasons: [...pendingReasons],
    lastBuildCompletedAt: lastBuildCompletedAt || null,
    lastBuildError,
  };
}
```
Update the exec callback to track `lastBuildError` and `lastBuildCompletedAt`.

**Commit:** `feat(rebuild): add build status API endpoint for admin visibility (#142)`

---

## Task 17: Static site SEO fixes (#116, #122, #126, #134, #157)

**Closes:** #116, #122, #126, #134, #157

**Files:**
- Modify: `apps/web/app/vijesti/[slug]/page.tsx` (generateStaticParams, ~line 124)
- Modify: `apps/web/app/obavijesti/[slug]/page.tsx` (generateStaticParams, ~line 131)
- Create: `apps/web/app/not-found.tsx` (root-level 404)
- Modify: `apps/web/app/sitemap.ts` (~84 lines)
- Modify: `apps/web/app/[...slug]/page.tsx` (generateMetadata, ~line 178)

**What to do:**

### #116 -- Remove generateStaticParams limit
In `vijesti/[slug]/page.tsx`:
```typescript
// Remove limit: 100, fetch all published posts
const { posts } = await postsRepository.findPublished({});
// or use findPublishedForSitemap() which has no limit
const posts = await postsRepository.findPublishedForSitemap();
```
Same for `obavijesti/[slug]/page.tsx` -- use `findPublishedForSitemap()`.

### #122 -- Create Croatian 404 page
Create `apps/web/app/not-found.tsx`:
```tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-600">Stranica nije pronađena</p>
      <p className="mt-2 text-gray-500">
        Stranica koju tražite ne postoji ili je premještena.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Povratak na naslovnicu
      </Link>
    </main>
  );
}
```

### #126 -- Add announcements to sitemap
In `sitemap.ts`, add announcements query alongside posts/events/galleries:
```typescript
const [posts, events, galleries, announcements] = await Promise.all([
  postsRepository.findPublishedForSitemap(),
  eventsRepository.findPublishedForSitemap(),
  galleriesRepository.findAllForSitemap(),
  announcementsRepository.findPublishedForSitemap(),
]);

// Add /obavijesti listing page to staticRoutes
{ url: `${baseUrl}/obavijesti`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },

// Add individual announcement URLs
...announcements.map(a => ({
  url: `${baseUrl}/obavijesti/${a.slug}`,
  lastModified: a.updatedAt || a.publishedAt || a.createdAt,
  changeFrequency: 'weekly' as const,
  priority: 0.5,
})),
```

### #134 -- Limit historical events in static generation
For events, don't generate static pages older than 2 years:
```typescript
// In events generateStaticParams (if it exists) or sitemap
const twoYearsAgo = new Date();
twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
const events = await eventsRepository.findAll({
  from: twoYearsAgo,
  limit: 1000,
});
```
Old events can still be accessed via ISR/on-demand if needed.

### #157 -- Add description to catch-all pages
In `[...slug]/page.tsx` `generateMetadata()`:
```typescript
return {
  title: page.title,
  description: page.content
    ? stripHtml(page.content).slice(0, 160)
    : `${page.title} - Općina Veliki Bukovec`,
  openGraph: {
    title: page.title,
    description: page.content
      ? stripHtml(page.content).slice(0, 160)
      : `${page.title} - Općina Veliki Bukovec`,
    type: 'website',
  },
};
```

**Commit:** `fix(seo): remove static params limit, Croatian 404, sitemap announcements, page descriptions (#116, #122, #126, #134, #157)`

---

## Task 18: Static site -- Caddy & deploy config (#139, #144, #148, #152, #163)

**Closes:** #139, #144, #148, #152, #163

**Files:**
- These are VPS-side Caddy configuration changes
- Create: `scripts/caddy/Caddyfile.example` (reference config in repo)
- Modify: `apps/web/app/layout.tsx` or data fetching (for #139)

**What to do:**

### #139 -- External news fetch: Add timeout and error handling
Find where external RSS/news feeds are fetched during build and add:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout per fetch
try {
  const response = await fetch(url, { signal: controller.signal });
  // ... process
} catch (error) {
  console.warn(`Failed to fetch external news from ${url}:`, error);
  return []; // Return empty, don't block build
} finally {
  clearTimeout(timeoutId);
}
```

### #144, #152, #163 -- Caddy configuration fixes
Create `scripts/caddy/Caddyfile.example` with the correct configuration:
```caddyfile
n.velikibukovec.hr {
    root * /home/deploy/apps/web-static/current

    # Handle 404s with custom page (not SPA fallback)
    handle_errors {
        @404 expression {http.error.status_code} == 404
        handle @404 {
            rewrite * /404.html
            file_server
        }
    }

    # Cache headers for all static assets
    @static {
        path *.js *.css *.png *.jpg *.webp *.svg *.ico *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    # HTML pages: short cache
    @html {
        path_regexp \.html$
        not path *.js *.css *.png *.jpg *.webp *.svg *.ico *.woff2
    }
    header @html Cache-Control "public, max-age=3600, must-revalidate"

    # Default: try files, then 404 (NOT index.html fallback)
    try_files {path} {path}.html {path}/index.html
    file_server
}
```
Key changes:
- `try_files` does NOT fall through to `/index.html`
- Custom 404 handler serves `404.html`
- Cache headers use `path_regexp` for extension-less URLs too
- Document that `caddy reload` is needed after deploy

**Commit:** `fix(deploy): Caddy config fixes for 404, caching, example config in repo (#139, #144, #148, #152, #163)`

---

## Task 19: Static site -- Config coupling & R2 validation (#155, #165)

**Closes:** #155, #165

**Files:**
- Create: `scripts/audit/validate-cdn-urls.ts`

**What to do:**

### #155, #165 -- Build-time URL validation and config sync check
Create a lightweight audit script that can be run before/after builds:
```typescript
// scripts/audit/validate-cdn-urls.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';

const R2_URL_PATTERN = /https:\/\/pub-[a-f0-9]+\.r2\.dev\/[^\s"']+/g;
const files = glob.sync('apps/web/**/*.{tsx,ts,mdx}', { ignore: ['**/node_modules/**'] });

let allUrls: { file: string; url: string }[] = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const matches = content.matchAll(R2_URL_PATTERN);
  for (const match of matches) {
    allUrls.push({ file, url: match[0] });
  }
}

console.log(`Found ${allUrls.length} R2 CDN URLs across ${files.length} files`);

// Check each URL is reachable (HEAD request)
for (const { file, url } of allUrls) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      console.error(`BROKEN: ${url} (${response.status}) in ${file}`);
    }
  } catch {
    console.error(`UNREACHABLE: ${url} in ${file}`);
  }
}
```

For #165 (CSP/API URL coupling), document the relationship in a comment and create a pre-deploy check:
```typescript
// Add to the script:
// Check NEXT_PUBLIC_API_URL matches CSP connect-src in Caddyfile
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  console.log(`API URL configured: ${apiUrl}`);
  console.log('Verify this matches connect-src in Caddyfile CSP header');
}
```

**Commit:** `feat(audit): CDN URL validation script, CSP config sync documentation (#155, #165)`

---

## Task 20: Remaining low-priority items (#130, #142 already done)

**Closes:** #130

**Files:**
- Modify: `apps/web/app/vijesti/[slug]/page.tsx` (fetchPostBySlug error handling)

**What to do:**

### #130 -- DB failure: Preserve original error
In the post detail page, if the fetch fails, preserve the original error for debugging:
```typescript
async function fetchPostBySlug(slug: string) {
  try {
    return await postsRepository.findBySlug(slug);
  } catch (error) {
    // Log the real error for debugging
    console.error('Database error fetching post:', error);
    // Re-throw with context but include original
    throw new Error(`Failed to fetch post "${slug}"`, { cause: error });
  }
}
```

**Commit:** `fix: preserve original error in fetchPostBySlug (#130)`

---

## Issue Status Summary

| Task | Issues Closed | Priority |
|------|--------------|----------|
| 1 | #96, #98, #99, #100 | CRITICAL (security) |
| 2 | #113, #117, #123, #158 | CRITICAL (security) |
| 3 | #104, #107, #109 | HIGH (rate limiting) |
| 4 | #103, #138, #145 | HIGH (data integrity) |
| 5 | #108, #136, #153, #159 | HIGH (race conditions) |
| 6 | #94, #141, #154 | HIGH (reliability) |
| 7 | #92, #147, #161, #164 | HIGH (parsing bugs) |
| 8 | #101, #105, #112, #118, #125, #129, #151 | MEDIUM (pipeline flow) |
| 9 | #114, #120 | MEDIUM (slug generation) |
| 10 | #121, #131, #135, #156 | MEDIUM (transactions) |
| 11 | #111, #143 | MEDIUM (data integrity) |
| 12 | #127, #150, #162 | MEDIUM (config/timezone) |
| 13 | #93, #95, #97, #110, #115, #140 | MEDIUM (rebuild core) |
| 14 | #102, #106, #110, #115, #119, #124, #128, #137, #140, #160 | MEDIUM (shell script) |
| 15 | #132, #133, #146, #149 | LOW (smart triggers) |
| 16 | #142 | LOW (observability) |
| 17 | #116, #122, #126, #134, #157 | MEDIUM (SEO) |
| 18 | #139, #144, #148, #152, #163 | MEDIUM (deploy config) |
| 19 | #155, #165 | LOW (audit tooling) |
| 20 | #130 | LOW (error handling) |

**Total: 74 issues across 20 tasks**

---

## Execution Order

1. **Tasks 1-2** (security) -- Do these first, they fix active vulnerabilities
2. **Tasks 3-4** (rate limiting, audit) -- Quick wins, high impact
3. **Tasks 5-7** (AI queue + pipeline) -- Core reliability
4. **Tasks 8-9** (pipeline flow, slugs) -- Quality improvements
5. **Tasks 10-12** (data integrity, config) -- Database hardening
6. **Tasks 13-16** (rebuild system) -- All rebuild changes together
7. **Tasks 17-20** (static site, SEO, low priority) -- Polish

After each task: `pnpm type-check && pnpm --filter @repo/admin test && pnpm --filter @repo/database test`

Deploy after tasks 1-2 (security), then batch deploy remaining.
