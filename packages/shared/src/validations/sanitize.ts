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

export function sanitizeSingleLine(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = stripUnsafeCharacters(value)
    .replace(MULTI_SPACE, ' ')
    .trim();

  return normalized;
}

export function sanitizeMultiline(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = stripUnsafeCharacters(value)
    .replace(/\r\n/g, '\n')
    .trim();

  return normalized;
}

export function sanitizeEmail(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = stripUnsafeCharacters(value)
    .toLowerCase()
    .trim();

  return normalized;
}
