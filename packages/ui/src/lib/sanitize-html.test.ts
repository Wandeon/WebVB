import { describe, expect, it } from 'vitest';

import { sanitizeInlineHtml } from './sanitize-html';

describe('sanitizeInlineHtml', () => {
  it('removes script tags while preserving inline markup', () => {
    const input = '<mark>Važno</mark><script>alert("x")</script>';
    const sanitized = sanitizeInlineHtml(input);

    expect(sanitized).toContain('<mark>Važno</mark>');
    expect(sanitized).not.toContain('<script>');
  });
});
