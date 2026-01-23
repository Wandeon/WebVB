# CLAUDE.md - Claude Code Instructions

> This file contains instructions for Claude Code when working on the Veliki Bukovec project.
> Read this file completely before making any changes.

## Project Overview

**Project:** Veliki Bukovec Municipality Website
**Type:** Full-stack web application (public site + admin panel)
**Stack:** Next.js 16, TypeScript, PostgreSQL, Better Auth, Tailwind CSS v4, shadcn/ui
**Purpose:** Digital transformation for Croatian municipality - showcase project

## Critical Rules

### 0. SECURITY IS RULE #1
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️  SECURITY VIOLATIONS = IMMEDIATE STOP                       │
│                                                                 │
│  • NEVER expose services to 0.0.0.0 or public internet          │
│  • NEVER hardcode secrets, API keys, passwords                  │
│  • NEVER commit .env files                                      │
│  • NEVER disable firewalls or security features                 │
│  • NEVER skip input validation                                  │
│  • ALWAYS use environment variables for secrets                 │
│  • ALWAYS bind services to localhost or Tailscale IP            │
│  • ALWAYS validate and sanitize all inputs                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1. ALWAYS Read Before Writing
- Read DECISIONS.md before making architectural choices
- Read existing code in the module before adding new code
- Understand the context before implementing

### 2. NEVER Break These Rules
- **No code without tests** - Write tests for new functionality
- **No direct database queries** - Use repository pattern in `packages/database`
- **No hardcoded strings** - Use constants from `packages/shared/constants`
- **No any types** - Full TypeScript strict mode
- **No console.log in production** - Use proper logging
- **No secrets in code** - Use environment variables
- **No skipping validation** - Validate on client AND server with Zod

### 2b. ABSOLUTELY FORBIDDEN EXCUSES
```
These phrases are BANNED. If you catch yourself thinking them, STOP:

❌ "TS errors are preexisting"
   → YOU own ALL errors. Fix them or explain why they exist.

❌ "Skipping this test for now"
   → Tests reveal bugs. NEVER skip or loosen tests to make them pass.

❌ "Loosening this type to any"
   → Find the correct type. If truly impossible, document WHY.

❌ "This should work"
   → Verify it DOES work. Run the code.

❌ "I'll fix this later"
   → Fix it NOW or create a tracked issue.

❌ "It works on my end"
   → Not acceptable. Reproduce the full environment.
```

### 2c. TEST INTEGRITY
```
┌─────────────────────────────────────────────────────────────────┐
│  TESTS ARE SACRED                                               │
│                                                                 │
│  Tests exist to CATCH BUGS, not to pass CI.                     │
│                                                                 │
│  If a test fails:                                               │
│  1. The CODE is wrong, not the test (usually)                   │
│  2. Investigate WHY it fails                                    │
│  3. Fix the implementation                                      │
│  4. Only update test if requirements changed                    │
│                                                                 │
│  NEVER:                                                         │
│  • Delete tests to make CI pass                                 │
│  • Loosen assertions (expect.anything(), etc.)                  │
│  • Mock away the actual functionality being tested              │
│  • Change expected values to match wrong output                 │
│  • Use skip/xdescribe to hide failures                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2d. SCHEMA & FILE SIZE LIMITS
```
┌─────────────────────────────────────────────────────────────────┐
│  KEEP FILES SMALL AND FOCUSED                                   │
│                                                                 │
│  Prisma schema (schema.prisma): MAX 500 lines                   │
│  Component files: MAX 300 lines                                 │
│  Utility files: MAX 200 lines                                   │
│  Test files: MAX 500 lines                                      │
│                                                                 │
│  EXCEPTION: Orchestrator components                             │
│  Components that coordinate multiple subcomponents (e.g.,       │
│  PostEditor, SearchModal, AIGenerationFlow) may exceed 300      │
│  lines if the complexity is inherent to their coordination      │
│  role. Document why in a comment at the top of the file.        │
│                                                                 │
│  If a file grows beyond limits:                                 │
│  1. STOP and refactor                                           │
│  2. Split into logical modules                                  │
│  3. Never let schema bloat to 50k tokens!                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2e. DEFINITION OF DONE - NO HALF-FINISHED FEATURES
```
┌─────────────────────────────────────────────────────────────────┐
│  A FEATURE IS NOT "DONE" UNTIL:                                 │
│                                                                 │
│  □ NO TODO comments in the feature code                         │
│  □ NO FIXME comments                                            │
│  □ NO placeholder values or hardcoded test data                 │
│  □ NO console.log statements                                    │
│  □ NO commented-out code                                        │
│  □ NO "temporary" solutions                                     │
│  □ ALL error states handled                                     │
│  □ ALL loading states handled                                   │
│  □ ALL empty states handled                                     │
│  □ Tests written and passing                                    │
│  □ Works on mobile (375px)                                      │
│  □ Works on desktop                                             │
│                                                                 │
│  When reporting completion, you MUST provide:                   │
│  1. List of files created/modified                              │
│  2. Tests added (with pass count)                               │
│  3. Result of: grep -r "TODO\|FIXME" in feature code            │
│  4. Result of: pnpm lint && pnpm type-check && pnpm test        │
│                                                                 │
│  CI WILL BLOCK merges with TODO/FIXME in changed files          │
└─────────────────────────────────────────────────────────────────┘
```

**Banned phrases when reporting completion:**
```
❌ "Feature is done, just needs..."     → NOT DONE
❌ "Works, but I'll clean up..."        → NOT DONE
❌ "TODO: handle edge case"             → NOT DONE
❌ "Placeholder for now"                → NOT DONE
❌ "Will add tests later"               → NOT DONE
❌ "Quick fix, refactor later"          → NOT DONE
```

### 3. Git Workflow
```
1. Create feature branch: git checkout -b feat/feature-name
2. Make atomic commits with conventional format
3. Run tests before committing: pnpm test
4. Push and create PR
5. Wait for CI to pass
6. Merge only after review
```

**Commit Message Format:**
```
type(scope): description

feat(posts): add AI content generation
fix(auth): resolve session timeout issue
chore(deps): update dependencies
docs(api): add endpoint documentation
test(posts): add integration tests for CRUD
refactor(ui): simplify button variants
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`

### 4. File Organization
```
When creating new files:
- Components → apps/[app]/components/[category]/
- API routes → apps/admin/app/api/[resource]/
- Shared types → packages/shared/src/types/
- Validation schemas → packages/shared/src/schemas/
- Database operations → packages/database/src/repositories/
- UI primitives → packages/ui/src/primitives/
- Composite UI → packages/ui/src/components/
```

### 5. Code Style

**Imports (in order):**
```typescript
// 1. React/Next
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { motion } from 'framer-motion';
import { z } from 'zod';

// 3. Internal packages
import { Button } from '@repo/ui';
import { PostSchema } from '@repo/shared';

// 4. Local imports
import { PostCard } from '@/components/features';

// 5. Types
import type { Post } from '@repo/shared';
```

**Component Structure:**
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Subcomponents (if small)
// 6. Export

interface PostCardProps {
  post: Post;
  onEdit?: () => void;
}

export function PostCard({ post, onEdit }: PostCardProps) {
  // Hooks first
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>...</div>
  );
}
```

### 6. Testing Requirements

**What to test:**
- All API endpoints (integration tests)
- All validation schemas (unit tests)
- Complex business logic (unit tests)
- Critical user flows (E2E tests)

**Test file location:**
- Same directory as source: `post-editor.test.tsx`
- Or in `__tests__` folder for larger modules

**Minimum coverage:**
- New features: 80%+ coverage
- Bug fixes: Add regression test
- Utilities: 100% coverage

### 7. Error Handling

**API Errors:**
```typescript
// Return consistent error format
return NextResponse.json(
  {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Naslov je obavezan', // Croatian, user-friendly
      details: { field: 'title' }
    }
  },
  { status: 400 }
);
```

**Client-side:**
```typescript
try {
  await createPost(data);
  toast.success('Objava je uspješno kreirana');
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

### 8. Database Operations

**Always use repositories:**
```typescript
// Good
import { postsRepository } from '@repo/database';
const posts = await postsRepository.findAll({ category: 'sport' });

// Bad - never do this
import { db } from '@repo/database';
const posts = await db.post.findMany({ where: { category: 'sport' } });
```

### 9. UI Components

**Use design system:**
```typescript
// Good - use primitives from @repo/ui
import { Button, Input, Card } from '@repo/ui';

// Bad - don't create custom basic components
<button className="...">Click</button>
```

**Animation pattern:**
```typescript
import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/animations';

<motion.div {...fadeInUp}>
  Content
</motion.div>
```

### 10. API Design

**RESTful conventions:**
```
GET    /api/posts          → List (with pagination, filters)
GET    /api/posts/:id      → Get single
POST   /api/posts          → Create
PUT    /api/posts/:id      → Update
DELETE /api/posts/:id      → Delete
POST   /api/posts/:id/publish → Custom action
```

**Response format:**
```typescript
// Success
{ success: true, data: {...} }

// List
{ success: true, data: [...], pagination: { page, limit, total } }

// Error
{ success: false, error: { code, message, details? } }
```

## Project-Specific Context

### Language
- All user-facing text in **Croatian**
- Code comments in English
- Commit messages in English

### User Roles
- `super_admin`: You (developer), full access
- `admin`: Mayor (načelnik), can delete
- `staff`: Staff members, can create/edit

### AI Content Generation
When implementing AI features:
1. Always use multi-step pipeline (generate → review → human edit)
2. Use Ollama Cloud for LLM (Llama 3.1 70B Pro/Max plan)
3. Use local Ollama on VPS for embeddings (nomic-embed-text)
4. Google Search for context gathering
5. Queue all AI requests via ai_queue table (handles rate limits)
6. Retry on rate limit (up to 3 attempts, 30s backoff)
7. Never auto-publish without human approval

### Mobile-First
- Design for 375px first
- All touch targets minimum 44x44px
- Test on mobile before desktop

## When Stuck

1. Check DECISIONS.md for architectural guidance
2. Look for similar implementations in codebase
3. Ask for clarification before guessing
4. Prefer simple solutions over clever ones

## Forbidden Actions

### Code Quality
- Modifying database schema without updating DECISIONS.md
- Adding new dependencies without justification
- Removing tests to make CI pass
- Committing directly to main
- Using `// @ts-ignore` or `any` types
- Skipping accessibility considerations
- Letting any file exceed size limits (see 2d above)
- Using `expect.anything()` or loose matchers to pass tests
- Marking tests as `.skip` or `xdescribe` to hide failures

### Security (CRITICAL)
- Hardcoding API keys, secrets, or passwords
- Binding services to 0.0.0.0 or public IPs
- Committing .env files
- Exposing internal services to public
- Disabling security features "temporarily"
- Logging sensitive data (passwords, tokens, PII)
- Using `dangerouslySetInnerHTML` without sanitization
- Trusting client-side data without server validation

### Infrastructure
- Running as root user
- Opening ports beyond what's needed
- Disabling firewalls
- Storing secrets in code or configs
- Creating logs without rotation (disk explosion!)
- Using weak passwords or default credentials

## Logging Rules

```typescript
// GOOD - Structured logging with rotation
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

logger.info({ userId, action: 'post_created' }, 'User created post');

// BAD - Console.log (no rotation, no structure)
console.log('User created post', userId);

// FORBIDDEN - Logging sensitive data
logger.info({ password, token }); // NEVER DO THIS
```

**Log Levels:**
- `error`: Errors that need attention
- `warn`: Potential issues
- `info`: Normal operations (use sparingly)
- `debug`: Development only, never in prod

## VPS Access

Always use Tailscale for VPS access:
```bash
# SSH via Tailscale IP, never public IP
ssh deploy@100.x.x.x

# Database access (only if absolutely needed)
psql -h 100.x.x.x -U deploy -d velikibukovec

# Never expose services to public
```

## Environment Variables

```typescript
// ALWAYS validate at startup
import { validateEnv } from '@repo/shared/env';
const env = validateEnv(); // Exits if invalid

// NEVER access process.env directly in code
// Use the validated env object instead
const apiKey = env.OLLAMA_CLOUD_API_KEY;

// NEVER log environment variables
console.log(process.env); // FORBIDDEN
```
