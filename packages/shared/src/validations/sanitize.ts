// eslint-disable-next-line no-control-regex -- Intentionally matching control chars for sanitization
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SCRIPT_STYLE_BLOCKS = /<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi;
const HTML_TAGS = /<[^>]*>/g;
const MULTI_SPACE = /\s+/g;

function stripUnsafeCharacters(value: string): string {
  return value
    .replace(SCRIPT_STYLE_BLOCKS, '')
    .replace(HTML_TAGS, '')
    .replace(CONTROL_CHARACTERS, '');
}

/**
 * Sanitize single-line string: strip HTML/control chars, collapse whitespace, trim.
 * Type-safe version for use with z.string().transform()
 */
export function sanitizeSingleLineString(value: string): string {
  return stripUnsafeCharacters(value)
    .replace(MULTI_SPACE, ' ')
    .trim();
}

/**
 * Sanitize multi-line string: strip HTML/control chars, normalize line endings, trim.
 * Type-safe version for use with z.string().transform()
 */
export function sanitizeMultilineString(value: string): string {
  return stripUnsafeCharacters(value)
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * Sanitize email: strip HTML/control chars, lowercase, trim.
 * Type-safe version for use with z.string().transform()
 */
export function sanitizeEmailString(value: string): string {
  return stripUnsafeCharacters(value)
    .toLowerCase()
    .trim();
}

/**
 * Sanitize unknown value to single-line string.
 * For use with z.preprocess() when input type is unknown.
 */
export function sanitizeSingleLine(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return sanitizeSingleLineString(value);
}

/**
 * Sanitize unknown value to multi-line string.
 * For use with z.preprocess() when input type is unknown.
 */
export function sanitizeMultiline(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return sanitizeMultilineString(value);
}

/**
 * Sanitize unknown value to email string.
 * For use with z.preprocess() when input type is unknown.
 */
export function sanitizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return sanitizeEmailString(value);
}
