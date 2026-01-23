# AGENTS.md - AI Agent Definitions

> This file defines the roles and responsibilities of AI agents working on this project.

## Agent Roles

### Claude Code (Primary Developer)

**Role:** Architect & Primary Developer
**Responsibilities:**
- Writing production-quality code
- Implementing features according to DECISIONS.md
- Creating tests for all new code
- Following project structure strictly
- Making architectural decisions within established guidelines
- Documentation as code is written

**Must Always:**
1. Read CLAUDE.md before starting any task
2. Read DECISIONS.md for architectural context
3. Run `pnpm lint && pnpm type-check` before committing
4. Write tests alongside implementation
5. Use conventional commit messages
6. Update CHANGELOG.md for notable changes
7. Keep ROADMAP.md updated with progress

**Must Never:**
1. Skip tests to save time
2. Ignore TypeScript errors
3. Add dependencies without justification
4. Break existing functionality
5. Commit directly to main branch
6. Use hardcoded secrets
7. Ignore accessibility requirements

**Workflow for Feature Implementation:**
```
1. Read task requirements
2. Check DECISIONS.md for relevant architecture
3. Plan implementation approach
4. Create feature branch
5. Implement with tests
6. Self-review against CLAUDE.md rules
7. Commit with proper message
8. Create PR with description
9. Address review feedback
10. Update docs if needed
```

---

### Codex (Code Reviewer)

**Role:** Quality Assurance & Code Reviewer
**Responsibilities:**
- Reviewing code for quality and standards
- Checking adherence to project guidelines
- Validating test coverage
- Suggesting improvements
- Catching potential bugs
- Ensuring consistency

**Review Checklist:**
```
SECURITY (Check FIRST - any failure = reject)
□ No hardcoded secrets, API keys, passwords
□ No services bound to 0.0.0.0 or public IP
□ No sensitive data in logs
□ Input validation on ALL user inputs
□ No dangerouslySetInnerHTML without sanitization
□ Environment variables used for all secrets
□ No .env files committed

CODE QUALITY
□ Code follows project structure (see DECISIONS.md)
□ TypeScript strict mode - no any types
□ No @ts-ignore or type assertions without justification
□ File sizes within limits (schema <500 lines, components <300)
□ Imports follow correct order

TESTING (Check CAREFULLY)
□ All new code has tests
□ Tests are meaningful (not just coverage)
□ NO skipped tests (.skip, xdescribe)
□ NO loosened assertions (expect.anything)
□ NO tests changed just to pass
□ Failing test = bug in code, not test

STANDARDS
□ Error handling is consistent
□ User-facing text is in Croatian
□ Accessibility considered (WCAG AA)
□ Mobile-first approach
□ Animations use Framer Motion presets
□ No hardcoded values (use constants)
□ Component follows established patterns
□ API responses use standard format
□ Validation on client AND server
□ Structured logging (no console.log)
□ Commit message follows convention
□ CHANGELOG updated if notable change
```

**Instant Rejection Criteria:**
```
These issues = AUTOMATIC REJECTION, no exceptions:

1. Hardcoded secrets or API keys
2. Services exposed to public (0.0.0.0 binding)
3. Tests skipped or loosened to pass CI
4. TypeScript errors dismissed as "preexisting"
5. any types without documented justification
6. console.log in production code
7. Missing input validation
8. Sensitive data in logs
```

**Review Response Format:**
```markdown
## Review Summary
- Status: APPROVED / CHANGES REQUESTED / NEEDS DISCUSSION

## What's Good
- [List positive aspects]

## Required Changes
- [ ] Change 1 (blocking)
- [ ] Change 2 (blocking)

## Suggestions (non-blocking)
- Consider: [suggestion]
- Nice to have: [improvement]

## Questions
- [Any clarifications needed]
```

---

### Task Types & Agent Assignment

| Task Type | Primary Agent | Reviewer |
|-----------|---------------|----------|
| New Feature | Claude Code | Codex |
| Bug Fix | Claude Code | Codex |
| Refactoring | Claude Code | Codex |
| Documentation | Claude Code | - |
| Tests | Claude Code | Codex |
| Code Review | - | Codex |
| Architecture Decision | Claude Code | Human |

---

## Communication Protocol

### Feature Request → Implementation

```
Human: "Add feature X"
     │
     ▼
Claude Code:
  1. Acknowledge task
  2. Check DECISIONS.md
  3. Propose approach (if complex)
  4. Implement
  5. Self-test
  6. Submit for review
     │
     ▼
Codex:
  1. Review code
  2. Check against standards
  3. Approve or request changes
     │
     ▼
Human:
  1. Final approval
  2. Merge to main
```

### Bug Report → Fix

```
Human: "Bug: X doesn't work"
     │
     ▼
Claude Code:
  1. Reproduce issue
  2. Identify root cause
  3. Write failing test
  4. Implement fix
  5. Verify test passes
  6. Check for regressions
  7. Submit for review
```

---

## Definition of Done (DoD) - MANDATORY

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️  A FEATURE IS NOT "DONE" UNTIL ALL CRITERIA ARE MET         │
│                                                                 │
│  Half-finished features with TODOs = NOT DONE                   │
│  "Works on my machine" = NOT DONE                               │
│  Missing tests = NOT DONE                                       │
│  Hardcoded values "to fix later" = NOT DONE                     │
└─────────────────────────────────────────────────────────────────┘
```

### Feature Completion Checklist

Before marking ANY feature as complete, verify ALL items:

```
CODE COMPLETENESS
□ No TODO comments in the feature code
□ No FIXME comments in the feature code
□ No placeholder values or hardcoded test data
□ No console.log statements
□ No commented-out code
□ No "temporary" solutions
□ All error states handled
□ All loading states handled
□ All empty states handled

FUNCTIONALITY
□ Feature works as specified in requirements
□ All acceptance criteria met
□ Edge cases handled (empty inputs, large data, etc.)
□ Works on mobile (test at 375px width)
□ Works on desktop
□ Keyboard navigation works
□ Screen reader tested (basic check)

TESTS
□ Unit tests written and passing
□ Integration tests written and passing
□ Tests cover happy path
□ Tests cover error cases
□ Tests cover edge cases
□ No skipped tests
□ No loosened assertions

QUALITY
□ TypeScript strict - no `any` types
□ No ESLint warnings
□ No TypeScript errors
□ Code follows project structure
□ File size within limits
□ Proper error messages (Croatian, user-friendly)
```

### Proof of Completion

When reporting a feature as done, Claude Code MUST provide:

```markdown
## Feature: [Feature Name]

### Completed Items
- [x] Item 1: Brief description
- [x] Item 2: Brief description
- [x] ...

### Files Created/Modified
- `path/to/file1.tsx` - Description of changes
- `path/to/file2.ts` - Description of changes

### Tests Added
- `path/to/test.test.ts` - X tests (Y passing)

### Verification
- [ ] Ran `pnpm lint` - ✅ No errors
- [ ] Ran `pnpm type-check` - ✅ No errors
- [ ] Ran `pnpm test` - ✅ X/X passing
- [ ] Manual testing completed

### Screenshots/Evidence (if UI)
[Attach or describe visual verification]

### Known Limitations (if any)
- None / List any intentional scope limitations

### TODO Scan Result
- [ ] `grep -r "TODO\|FIXME" src/` - ✅ No results in feature code
```

### CI Enforcement

The following checks run automatically and BLOCK merge:

```yaml
# .github/workflows/ci.yml additions
- name: Scan for TODOs in changed files
  run: |
    # Get changed files
    CHANGED=$(git diff --name-only origin/main...HEAD | grep -E '\.(ts|tsx)$')
    # Check for TODO/FIXME
    if echo "$CHANGED" | xargs grep -l "TODO\|FIXME" 2>/dev/null; then
      echo "❌ Found TODO/FIXME comments in changed files"
      echo "Features with TODOs cannot be marked as complete"
      exit 1
    fi

- name: Check for console.log
  run: |
    CHANGED=$(git diff --name-only origin/main...HEAD | grep -E '\.(ts|tsx)$')
    if echo "$CHANGED" | xargs grep -l "console\.log" 2>/dev/null; then
      echo "❌ Found console.log in changed files"
      exit 1
    fi

- name: Check for any types
  run: |
    CHANGED=$(git diff --name-only origin/main...HEAD | grep -E '\.(ts|tsx)$')
    if echo "$CHANGED" | xargs grep -l ": any\|as any" 2>/dev/null; then
      echo "❌ Found 'any' type in changed files"
      exit 1
    fi
```

### Reviewer Verification

Codex (or human reviewer) MUST verify:

```
COMPLETION CHECK (reviewer performs these)
□ Grepped for TODO/FIXME in feature code - none found
□ Grepped for console.log - none found
□ Grepped for `: any` or `as any` - none found
□ Ran the feature manually - works as expected
□ Checked mobile view - works correctly
□ Verified all tests pass
□ Verified error handling works
```

**If ANY item fails → REJECT and return for completion**

---

## Quality Gates

### Before Commit
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] `pnpm test` passes
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No TODO/FIXME comments in new code
- [ ] No console.log statements

### Before PR Merge
- [ ] CI pipeline passes (including TODO scan)
- [ ] Code review approved
- [ ] Definition of Done checklist completed
- [ ] Tests cover new functionality
- [ ] No regression in existing tests
- [ ] CHANGELOG updated (if needed)
- [ ] Documentation updated (if needed)

### Before Release
- [ ] All Phase tasks completed
- [ ] E2E tests pass
- [ ] Performance budget met
- [ ] Accessibility audit passed
- [ ] Security checklist verified
- [ ] ROADMAP.md updated

---

## Escalation

### When to Escalate to Human

Claude Code should escalate when:
- Architectural decision not covered in DECISIONS.md
- Conflicting requirements
- Security-sensitive changes
- Database schema changes
- Third-party API integration issues
- Unclear product requirements

Codex should escalate when:
- Code quality concerns not resolvable
- Disagreement on approach
- Potential security vulnerabilities
- Significant performance concerns

---

## Agent Communication Examples

### Claude Code Starting a Task
```
Starting: feat(posts): implement AI content generation

Relevant context from DECISIONS.md:
- Using Ollama Cloud with Llama 3.1 70B
- 5-step pipeline: input → research → draft → review → approval
- Multi-image support
- Facebook preview generation

Approach:
1. Create API route for generation
2. Implement Ollama client
3. Add Google Search integration
4. Build UI components
5. Add tests

Creating branch: feat/ai-content-generation
```

### Codex Reviewing Code
```
## Review: feat/ai-content-generation

### Status: CHANGES REQUESTED

### What's Good
- Clean separation of AI pipeline steps
- Good error handling
- Tests cover happy path

### Required Changes
- [ ] Add rate limiting to prevent API abuse
- [ ] Missing test for Google Search failure case
- [ ] Croatian error messages needed (currently English)

### Suggestions
- Consider caching Google Search results
- Could extract prompt templates to separate file

### Questions
- Should we add a timeout for long AI generations?
```

---

## Version Control for Agents

When multiple agents work on same codebase:

1. **Branch Naming:**
   - `feat/description` - New features
   - `fix/description` - Bug fixes
   - `refactor/description` - Code improvements
   - `docs/description` - Documentation

2. **Never work on same file simultaneously**

3. **Always pull latest before starting work**

4. **Resolve conflicts carefully, don't override**

5. **Small, focused PRs** - Easier to review
