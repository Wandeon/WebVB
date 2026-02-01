import { createHash } from 'crypto';

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
