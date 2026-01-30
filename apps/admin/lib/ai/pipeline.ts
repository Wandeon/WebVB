/**
 * AI Article Pipeline
 * Processes articles through REVIEW → REWRITE → POLISH stages
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

interface PipelineResult {
  article: Article;
  reviewHistory: ReviewResult[];
  rewriteCount: number;
  finalScore: number;
  passed: boolean;
}

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
      location: 'članak',
      text: word,
      fix: `Zamijeni riječ "${word}" s konkretnim opisom`,
    });
  }

  for (const phrase of banned.phrases) {
    issues.push({
      type: 'slop_phrase',
      location: 'članak',
      text: phrase,
      fix: `Ukloni frazu "${phrase}" ili je zamijeni konkretnom informacijom`,
    });
  }

  return issues;
}

/**
 * REVIEW stage: Score article and identify issues
 */
async function reviewArticle(article: Article): Promise<ReviewResult> {
  // First do pre-check for banned words
  const preCheckIssues = preCheck(article);

  // Call LLM for full review
  const prompt = buildReviewUserPrompt(article);
  const result = await generate(prompt, { system: REVIEW_SYSTEM_PROMPT });

  if (!result.success) {
    aiLogger.error({ error: result.error }, 'Review stage failed');
    // Return a failing review with pre-check issues
    return {
      scores: { clarity: 5, localRelevance: 5, slopScore: 5, flow: 5 },
      overall: 5,
      pass: false,
      issues: preCheckIssues.length > 0 ? preCheckIssues : [{
        type: 'grammar',
        location: 'članak',
        fix: 'Pregledaj članak i ispravi moguće probleme',
      }],
    };
  }

  const parsed = parseReviewResponse(result.data.response);

  if (!parsed) {
    aiLogger.warn('Failed to parse review response');
    return {
      scores: { clarity: 5, localRelevance: 5, slopScore: 5, flow: 5 },
      overall: 5,
      pass: false,
      issues: preCheckIssues,
    };
  }

  // Merge pre-check issues with LLM issues
  const allIssues = [...preCheckIssues, ...parsed.issues];

  // If we found banned words, force fail
  if (preCheckIssues.length > 0) {
    parsed.pass = false;
    // Reduce slop score if banned words found
    parsed.scores.slopScore = Math.min(parsed.scores.slopScore, 4);
    parsed.overall = (
      parsed.scores.clarity +
      parsed.scores.localRelevance +
      parsed.scores.slopScore +
      parsed.scores.flow
    ) / 4;
  }

  return {
    ...parsed,
    issues: allIssues,
  };
}

/**
 * REWRITE stage: Fix identified issues
 */
async function rewriteArticle(
  article: Article,
  issues: ReviewIssue[]
): Promise<Article> {
  if (issues.length === 0) {
    return article;
  }

  const prompt = buildRewriteUserPrompt(article, issues);
  const result = await generate(prompt, { system: REWRITE_SYSTEM_PROMPT });

  if (!result.success) {
    aiLogger.error({ error: result.error }, 'Rewrite stage failed');
    return article; // Return original if rewrite fails
  }

  // Parse response
  try {
    const jsonMatch = result.data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return article;

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
      return parsed as Article;
    }
  } catch (error) {
    aiLogger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to parse rewrite response'
    );
  }

  return article;
}

/**
 * POLISH stage: Final grammar/spelling pass
 */
async function polishArticle(article: Article): Promise<Article> {
  const prompt = buildPolishUserPrompt(article);
  const result = await generate(prompt, { system: POLISH_SYSTEM_PROMPT });

  if (!result.success) {
    aiLogger.error({ error: result.error }, 'Polish stage failed');
    return article; // Return original if polish fails
  }

  // Parse response
  try {
    const jsonMatch = result.data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return article;

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
      return parsed as Article;
    }
  } catch (error) {
    aiLogger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to parse polish response'
    );
  }

  return article;
}

// =============================================================================
// Main Pipeline
// =============================================================================

/**
 * Run the full article pipeline: REVIEW → REWRITE (loop) → POLISH
 */
export async function runArticlePipeline(article: Article): Promise<PipelineResult> {
  const reviewHistory: ReviewResult[] = [];
  let currentArticle = article;
  let rewriteCount = 0;

  aiLogger.info('Starting article pipeline');

  // Stage 1: Initial REVIEW
  aiLogger.info('Pipeline stage: REVIEW');
  let review = await reviewArticle(currentArticle);
  reviewHistory.push(review);

  // Stage 2: REWRITE loop (max 2 attempts)
  while (
    !review.pass &&
    review.issues.length > 0 &&
    rewriteCount < PIPELINE_CONFIG.maxRewriteAttempts
  ) {
    aiLogger.info(
      { attempt: rewriteCount + 1, issueCount: review.issues.length },
      'Pipeline stage: REWRITE'
    );

    currentArticle = await rewriteArticle(currentArticle, review.issues);
    rewriteCount++;

    // Re-review after rewrite
    aiLogger.info('Pipeline stage: REVIEW (post-rewrite)');
    review = await reviewArticle(currentArticle);
    reviewHistory.push(review);
  }

  // Stage 3: POLISH (always run, even if review didn't pass)
  aiLogger.info('Pipeline stage: POLISH');
  currentArticle = await polishArticle(currentArticle);

  const finalScore = review.overall;
  const passed = review.pass;

  aiLogger.info(
    {
      finalScore,
      passed,
      rewriteCount,
      reviewCount: reviewHistory.length,
    },
    'Article pipeline complete'
  );

  return {
    article: currentArticle,
    reviewHistory,
    rewriteCount,
    finalScore,
    passed,
  };
}
