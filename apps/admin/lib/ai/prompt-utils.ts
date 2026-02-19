import { createHash } from 'crypto';

/**
 * Extract the first balanced JSON object from a string using brace counting.
 * Avoids the greedy regex problem where `{...}` matches from first `{` to LAST `}`.
 */
export function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    if (depth === 0) {
      try {
        return JSON.parse(text.slice(start, i + 1)) as unknown;
      } catch {
        return null;
      }
    }
  }

  return null; // Unbalanced braces
}

const INSTRUCTION_PATTERNS = [
  /^\s*(system|assistant|developer|user)\s*:/i,
  /ignore (all|previous|earlier) instructions/i,
  /disregard (all|previous|earlier) instructions/i,
  /follow (these|the following) instructions/i,
  /you are (chatgpt|an ai)/i,
  /<\s*system\s*>/i,
  /<\/\s*system\s*>/i,
  /###\s*system/i,
  /BEGIN_SYSTEM_PROMPT/i,
];

const DOCUMENT_WRAPPER_START = '---BEGIN_DOCUMENT---';
const DOCUMENT_WRAPPER_END = '---END_DOCUMENT---';

export function sanitizeDocumentText(text: string): {
  sanitized: string;
  redactions: number;
} {
  const lines = text.split('\n');
  let redactions = 0;

  const sanitizedLines = lines.map((line) => {
    if (INSTRUCTION_PATTERNS.some((pattern) => pattern.test(line))) {
      redactions += 1;
      return '[Uklonjena uputa]';
    }
    return line;
  });

  return {
    sanitized: sanitizedLines.join('\n').trim(),
    redactions,
  };
}

export function wrapDocumentForPrompt(text: string): string {
  return `${DOCUMENT_WRAPPER_START}\n${text}\n${DOCUMENT_WRAPPER_END}`;
}

export function hashText(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
