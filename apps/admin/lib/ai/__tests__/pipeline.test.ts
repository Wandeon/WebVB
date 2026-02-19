import { beforeEach, describe, expect, it, vi } from 'vitest';

import { parseReviewResponse } from '../prompts/review';
import { PIPELINE_CONFIG } from '../prompts/types';

// =============================================================================
// review parser tests (#147 -- issue validation)
// =============================================================================

describe('review parser', () => {
  it('parses valid issue-only review response', () => {
    const response = `
    {
      "pass": true,
      "issues": []
    }
    `;

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.pass).toBe(true);
    expect(result?.issues).toHaveLength(0);
  });

  it('parses review with issues', () => {
    const response = `
    {
      "pass": false,
      "issues": [
        {
          "type": "slop_word",
          "location": "odlomak 1",
          "text": "revolucionarno",
          "fix": "Zamijeni s konkretnim opisom"
        }
      ]
    }
    `;

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.pass).toBe(false);
    expect(result?.issues).toHaveLength(1);
    expect(result?.issues?.[0]?.type).toBe('slop_word');
  });

  it('extracts JSON from text with extra content', () => {
    const response = `
    Evo moje analize:

    {
      "pass": true,
      "issues": []
    }

    Nadam se da je ovo korisno!
    `;

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.pass).toBe(true);
  });

  it('returns null for invalid JSON', () => {
    const response = 'This is not JSON at all';

    const result = parseReviewResponse(response);

    expect(result).toBeNull();
  });

  it('returns null for missing required fields', () => {
    const response = '{ "something": "else" }';

    const result = parseReviewResponse(response);

    expect(result).toBeNull();
  });

  // #147: Issue validation tests
  it('filters out issues with invalid type values', () => {
    const response = JSON.stringify({
      pass: false,
      issues: [
        { type: 'slop_word', location: 'title', fix: 'Remove it' },
        { type: 'invalid_type', location: 'body', fix: 'Something' },
        { type: 'grammar', location: 'paragraph 1', fix: 'Fix spelling' },
      ],
    });

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.issues).toHaveLength(2);
    expect(result?.issues[0]?.type).toBe('slop_word');
    expect(result?.issues[1]?.type).toBe('grammar');
  });

  it('filters out issues missing required fields', () => {
    const response = JSON.stringify({
      pass: false,
      issues: [
        { type: 'grammar', location: 'title', fix: 'Fix it' }, // valid
        { type: 'grammar', location: 'title' }, // missing fix
        { type: 'grammar', fix: 'Fix it' }, // missing location
        { location: 'title', fix: 'Fix it' }, // missing type
        null, // null entry
        'not an object', // string entry
      ],
    });

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.issues).toHaveLength(1);
    expect(result?.issues[0]?.type).toBe('grammar');
  });

  it('allows optional text field in issues', () => {
    const response = JSON.stringify({
      pass: false,
      issues: [
        { type: 'grammar', location: 'paragraph 1', fix: 'Fix spelling' },
        { type: 'slop_word', location: 'title', text: 'revolucionarno', fix: 'Remove it' },
      ],
    });

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.issues).toHaveLength(2);
  });

  it('caps issues at 20 maximum', () => {
    const issues = Array.from({ length: 30 }, (_, i) => ({
      type: 'grammar',
      location: `paragraph ${i + 1}`,
      fix: `Fix issue ${i + 1}`,
    }));

    const response = JSON.stringify({ pass: false, issues });

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.issues).toHaveLength(20);
  });

  it('validates all known issue types', () => {
    const knownTypes = [
      'slop_word', 'slop_phrase', 'sentence_too_long', 'wall_of_text',
      'missing_concrete', 'missing_local', 'invented_fact', 'grammar',
    ];

    const issues = knownTypes.map((type) => ({
      type,
      location: 'test',
      fix: 'test fix',
    }));

    const response = JSON.stringify({ pass: false, issues });
    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.issues).toHaveLength(knownTypes.length);
  });
});

// =============================================================================
// pipeline config
// =============================================================================

describe('pipeline config', () => {
  it('has correct default values', () => {
    expect(PIPELINE_CONFIG.maxRewriteAttempts).toBe(2);
    expect(PIPELINE_CONFIG.maxSentenceWords).toBe(25);
    expect(PIPELINE_CONFIG.maxParagraphSentences).toBe(4);
  });
});

// =============================================================================
// runArticlePipeline tests (#164 -- PipelineFailure returns)
// =============================================================================

vi.mock('../ollama-cloud', () => ({
  generate: vi.fn(),
}));

vi.mock('../../logger', () => ({
  aiLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { generate } from '../ollama-cloud';
import { runArticlePipeline, STAGE_TEMPERATURE } from '../pipeline';
import { FEW_SHOT_EXAMPLES } from '../prompts/generate';

import type { OllamaGenerateResponse } from '../types';

const mockGenerate = vi.mocked(generate);

function llmSuccess(response: string) {
  return {
    success: true as const,
    data: {
      model: 'test-model',
      created_at: '2025-01-01T00:00:00Z',
      response,
      done: true,
    } satisfies OllamaGenerateResponse,
  };
}

function llmFailure() {
  return {
    success: false as const,
    error: { code: 'NETWORK_ERROR' as const, message: 'Connection failed' },
  };
}

describe('runArticlePipeline', () => {
  const testArticle = {
    title: 'Testni naslov',
    content: '<p>Testni sadržaj članka.</p>',
    excerpt: 'Kratki sažetak.',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns PipelineResult on full success', async () => {
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ pass: true, issues: [] }))
      )
      .mockResolvedValueOnce(
        llmSuccess(
          JSON.stringify({
            title: 'Polished title',
            content: '<p>Polished content.</p>',
            excerpt: 'Polished excerpt.',
          })
        )
      );

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.article.title).toBe('Polished title');
      expect(result.passed).toBe(true);
      expect(result.rewriteCount).toBe(0);
    }
  });

  it('returns PipelineFailure when rewrite stage parse fails (#164)', async () => {
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(
          JSON.stringify({
            pass: false,
            issues: [
              { type: 'grammar', location: 'paragraph 1', fix: 'Fix grammar' },
            ],
          })
        )
      )
      .mockResolvedValueOnce(llmSuccess('This is not JSON at all'));

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.stage).toBe('rewrite');
      expect(result.reason).toContain('Rewrite JSON extraction failed');
      expect(result.article).toEqual(testArticle);
    }
  });

  it('returns PipelineFailure when polish stage parse fails (#164)', async () => {
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ pass: true, issues: [] }))
      )
      .mockResolvedValueOnce(llmSuccess('Not valid JSON response'));

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.stage).toBe('polish');
      expect(result.reason).toContain('Polish JSON extraction failed');
      expect(result.article).toEqual(testArticle);
    }
  });

  it('returns PipelineFailure when rewrite returns missing fields (#164)', async () => {
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(
          JSON.stringify({
            pass: false,
            issues: [
              { type: 'slop_word', location: 'title', fix: 'Remove slop' },
            ],
          })
        )
      )
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ title: 'Only title, no content or excerpt' }))
      );

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.stage).toBe('rewrite');
      expect(result.reason).toContain('missing required fields');
    }
  });

  it('continues gracefully when review LLM fails entirely', async () => {
    mockGenerate
      .mockResolvedValueOnce(llmFailure())
      .mockResolvedValueOnce(
        llmSuccess(
          JSON.stringify({
            title: 'Polished',
            content: '<p>Polished content.</p>',
            excerpt: 'Polished excerpt.',
          })
        )
      );

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.passed).toBe(true);
      expect(result.rewriteCount).toBe(0);
    }
  });

  it('returns PipelineFailure when polish returns missing fields', async () => {
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ pass: true, issues: [] }))
      )
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ title: 'Only title' }))
      );

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.stage).toBe('polish');
      expect(result.reason).toContain('missing required fields');
    }
  });

  it('includes rawSample in PipelineFailure', async () => {
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ pass: true, issues: [] }))
      )
      .mockResolvedValueOnce(llmSuccess('Garbage output'));

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.rawSample).toBe('string');
      expect(result.rawSample.length).toBeGreaterThan(0);
      expect(result.rawSample.length).toBeLessThanOrEqual(500);
    }
  });

  it('includes the best-effort article in PipelineFailure', async () => {
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ pass: true, issues: [] }))
      )
      .mockResolvedValueOnce(llmSuccess('Not JSON'));

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.article).toEqual(testArticle);
    }
  });

  // #105: Post-polish banned word revert
  it('reverts to pre-polish article when polish introduces banned words (#105)', async () => {
    // Review passes, then polish introduces "revolucionarno" (banned word)
    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ pass: true, issues: [] }))
      )
      .mockResolvedValueOnce(
        llmSuccess(
          JSON.stringify({
            title: 'Revolucionarno otvaranje ceste',
            content: '<p>Ovo je revolucionarno za selo.</p>',
            excerpt: 'Revolucionarno otvaranje.',
          })
        )
      );

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(true);
    if (result.success) {
      // Should revert to original (pre-polish) article
      expect(result.article).toEqual(testArticle);
    }
  });

  // #105: Polish without banned words should keep polished version
  it('keeps polished article when polish does not introduce banned words (#105)', async () => {
    const cleanPolished = {
      title: 'Cesta otvorena za promet',
      content: '<p>Cesta je otvorena.</p>',
      excerpt: 'Cesta otvorena.',
    };

    mockGenerate
      .mockResolvedValueOnce(
        llmSuccess(JSON.stringify({ pass: true, issues: [] }))
      )
      .mockResolvedValueOnce(llmSuccess(JSON.stringify(cleanPolished)));

    const result = await runArticlePipeline(testArticle);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.article).toEqual(cleanPolished);
    }
  });
});

// =============================================================================
// STAGE_TEMPERATURE export (#118)
// =============================================================================

describe('STAGE_TEMPERATURE', () => {
  it('exports expected temperature values (#118)', () => {
    expect(STAGE_TEMPERATURE.generate).toBe(0.3);
    expect(STAGE_TEMPERATURE.review).toBe(0.15);
    expect(STAGE_TEMPERATURE.rewrite).toBe(0.2);
    expect(STAGE_TEMPERATURE.polish).toBe(0.15);
  });
});

// =============================================================================
// FEW_SHOT_EXAMPLES export (#125)
// =============================================================================

describe('FEW_SHOT_EXAMPLES', () => {
  it('exports non-empty array of examples (#125)', () => {
    expect(Array.isArray(FEW_SHOT_EXAMPLES)).toBe(true);
    expect(FEW_SHOT_EXAMPLES.length).toBeGreaterThan(0);
  });

  it('each example has required structure', () => {
    for (const example of FEW_SHOT_EXAMPLES) {
      expect(typeof example.instructions).toBe('string');
      expect(typeof example.category).toBe('string');
      expect(typeof example.response.title).toBe('string');
      expect(typeof example.response.content).toBe('string');
      expect(typeof example.response.excerpt).toBe('string');
    }
  });
});
