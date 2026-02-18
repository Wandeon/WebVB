/**
 * AI Article Pipeline
 * Processes articles through REVIEW -> REWRITE -> POLISH stages
 * Issue-only review: pass/fail based on concrete violations, not scores
 */

import { aiLogger } from '../logger';
import { generate } from './ollama-cloud';
import {
  buildPolishUserPrompt,
  buildReviewUserPrompt,
  buildRewriteUserPrompt,
  findAllBanned,
  parseReviewResponse,
  PIPELINE_CONFIG,
  POLISH_SYSTEM_PROMPT,
  REVIEW_SYSTEM_PROMPT,
  REWRITE_SYSTEM_PROMPT,
} from './prompts';

import type { ReviewIssue, ReviewResult } from './prompts';

// =============================================================================
// Types
// =============================================================================

interface Article {
  title: string;
  content: string;
  excerpt: string;
}

export interface PipelineResult {
  success: true;
  article: Article;
  reviewHistory: ReviewResult[];
  rewriteCount: number;
  passed: boolean;
}

export interface PipelineFailure {
  success: false;
  stage: 'review' | 'rewrite' | 'polish';
  reason: string;
  rawSample: string;
  article: Article;
}

// =============================================================================
// Per-Stage Temperature
// =============================================================================

const STAGE_TEMPERATURE = {
  generate: 0.3,
  review: 0.15,
  rewrite: 0.2,
  polish: 0.15,
} as const;

// =============================================================================
// Pipeline Stages
// =============================================================================

/**
 * Pre-check for banned words/phrases before LLM review
 * Returns issues that can be detected without LLM
 */
function preCheck(article: Article): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const fullText = `${article.title} ${article.excerpt} ${article.content}`;

  const banned = findAllBanned(fullText);

  for (const word of banned.words) {
    issues.push({
      type: 'slop_word',
      location: 'article',
      text: word,
      fix: `Zamijeni riječ "${word}" s konkretnim opisom`,
    });
  }

  for (const phrase of banned.phrases) {
    issues.push({
      type: 'slop_phrase',
      location: 'article',
      text: phrase,
      fix: `Ukloni frazu "${phrase}" ili je zamijeni konkretnom informacijom`,
    });
  }

  return issues;
}

/**
 * REVIEW stage: Identify concrete issues (no scores)
 */
async function reviewArticle(
  article: Article
): Promise<{ review: ReviewResult; parseError?: string }> {
  const preCheckIssues = preCheck(article);

  const prompt = buildReviewUserPrompt(article);
  const result = await generate(prompt, {
    system: REVIEW_SYSTEM_PROMPT,
    temperature: STAGE_TEMPERATURE.review,
  });

  if (!result.success) {
    aiLogger.error({ error: result.error }, 'Review stage LLM call failed');
    // Return pre-check issues only; if none, pass
    return {
      review: {
        pass: preCheckIssues.length === 0,
        issues: preCheckIssues,
      },
    };
  }

  const parsed = parseReviewResponse(result.data.response);

  if (!parsed) {
    const rawSample = result.data.response.slice(0, 200);
    aiLogger.warn({ rawSample }, 'Failed to parse review response');
    return {
      review: {
        pass: preCheckIssues.length === 0,
        issues: preCheckIssues,
      },
      parseError: `Review JSON parse failed. Raw: ${rawSample}`,
    };
  }

  // Merge pre-check issues with LLM issues (pre-check takes priority)
  const allIssues = [...preCheckIssues, ...parsed.issues];

  return {
    review: {
      pass: allIssues.length === 0,
      issues: allIssues,
    },
  };
}

/**
 * REWRITE stage: Fix identified issues
 */
async function rewriteArticle(
  article: Article,
  issues: ReviewIssue[]
): Promise<{ article: Article; parseError?: string }> {
  if (issues.length === 0) {
    return { article };
  }

  const prompt = buildRewriteUserPrompt(article, issues);
  const result = await generate(prompt, {
    system: REWRITE_SYSTEM_PROMPT,
    temperature: STAGE_TEMPERATURE.rewrite,
  });

  if (!result.success) {
    aiLogger.error({ error: result.error }, 'Rewrite stage LLM call failed');
    return { article };
  }

  try {
    const jsonMatch = result.data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const rawSample = result.data.response.slice(0, 200);
      return {
        article,
        parseError: `Rewrite JSON extraction failed. Raw: ${rawSample}`,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as unknown;

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'title' in parsed &&
      'content' in parsed &&
      'excerpt' in parsed &&
      typeof (parsed as Article).title === 'string' &&
      typeof (parsed as Article).content === 'string' &&
      typeof (parsed as Article).excerpt === 'string'
    ) {
      return { article: parsed as Article };
    }

    return {
      article,
      parseError: `Rewrite response missing required fields`,
    };
  } catch (error) {
    const rawSample = result.data.response.slice(0, 200);
    aiLogger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to parse rewrite response'
    );
    return {
      article,
      parseError: `Rewrite JSON parse error: ${error instanceof Error ? error.message : 'unknown'}. Raw: ${rawSample}`,
    };
  }
}

/**
 * POLISH stage: Final grammar/spelling pass
 */
async function polishArticle(
  article: Article
): Promise<{ article: Article; parseError?: string }> {
  const prompt = buildPolishUserPrompt(article);
  const result = await generate(prompt, {
    system: POLISH_SYSTEM_PROMPT,
    temperature: STAGE_TEMPERATURE.polish,
  });

  if (!result.success) {
    aiLogger.error({ error: result.error }, 'Polish stage LLM call failed');
    return { article };
  }

  try {
    const jsonMatch = result.data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const rawSample = result.data.response.slice(0, 200);
      return {
        article,
        parseError: `Polish JSON extraction failed. Raw: ${rawSample}`,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as unknown;

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'title' in parsed &&
      'content' in parsed &&
      'excerpt' in parsed &&
      typeof (parsed as Article).title === 'string' &&
      typeof (parsed as Article).content === 'string' &&
      typeof (parsed as Article).excerpt === 'string'
    ) {
      return { article: parsed as Article };
    }

    return {
      article,
      parseError: `Polish response missing required fields`,
    };
  } catch (error) {
    const rawSample = result.data.response.slice(0, 200);
    aiLogger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to parse polish response'
    );
    return {
      article,
      parseError: `Polish JSON parse error: ${error instanceof Error ? error.message : 'unknown'}. Raw: ${rawSample}`,
    };
  }
}

// =============================================================================
// Main Pipeline
// =============================================================================

/**
 * Run the full article pipeline: REVIEW -> REWRITE (loop) -> POLISH
 * Returns structured success or failure with stage/reason/rawSample
 */
export async function runArticlePipeline(
  article: Article
): Promise<PipelineResult | PipelineFailure> {
  const reviewHistory: ReviewResult[] = [];
  let currentArticle = article;
  let rewriteCount = 0;

  aiLogger.info('Starting article pipeline');

  // Stage 1: Initial REVIEW
  aiLogger.info('Pipeline stage: REVIEW');
  const reviewResult = await reviewArticle(currentArticle);
  let review = reviewResult.review;
  reviewHistory.push(review);

  if (reviewResult.parseError) {
    aiLogger.warn({ parseError: reviewResult.parseError }, 'Review parse issue (continuing with pre-check only)');
  }

  // Stage 2: REWRITE loop (max attempts)
  while (
    !review.pass &&
    review.issues.length > 0 &&
    rewriteCount < PIPELINE_CONFIG.maxRewriteAttempts
  ) {
    aiLogger.info(
      { attempt: rewriteCount + 1, issueCount: review.issues.length },
      'Pipeline stage: REWRITE'
    );

    const rewriteResult = await rewriteArticle(currentArticle, review.issues);
    currentArticle = rewriteResult.article;
    rewriteCount++;

    if (rewriteResult.parseError) {
      aiLogger.warn({ parseError: rewriteResult.parseError }, 'Rewrite parse issue');
    }

    // Re-review after rewrite
    aiLogger.info('Pipeline stage: REVIEW (post-rewrite)');
    const reReviewResult = await reviewArticle(currentArticle);
    review = reReviewResult.review;
    reviewHistory.push(review);
  }

  // Stage 3: POLISH (always run, even if review didn't pass)
  aiLogger.info('Pipeline stage: POLISH');
  const polishResult = await polishArticle(currentArticle);
  currentArticle = polishResult.article;

  if (polishResult.parseError) {
    aiLogger.warn({ parseError: polishResult.parseError }, 'Polish parse issue');
  }

  const passed = review.pass;

  aiLogger.info(
    {
      passed,
      rewriteCount,
      reviewCount: reviewHistory.length,
      finalIssueCount: review.issues.length,
    },
    'Article pipeline complete'
  );

  return {
    success: true,
    article: currentArticle,
    reviewHistory,
    rewriteCount,
    passed,
  };
}
