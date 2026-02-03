'use client';

import { Fragment } from 'react';

interface SearchHighlightProps {
  text: string;
  className?: string;
  highlightClassName?: string;
}

const MARK_OPEN = '<mark>';
const MARK_CLOSE = '</mark>';

function parseHighlightedText(text: string) {
  const sanitized = text.replace(/<(?!\/?mark\b)[^>]*>/gi, '');
  const parts = sanitized.split(/(<mark>|<\/mark>)/g);
  const tokens: Array<{ text: string; highlighted: boolean }> = [];
  let highlighted = false;

  for (const part of parts) {
    if (!part) {
      continue;
    }

    if (part === MARK_OPEN) {
      highlighted = true;
      continue;
    }

    if (part === MARK_CLOSE) {
      highlighted = false;
      continue;
    }

    tokens.push({ text: part, highlighted });
  }

  return tokens;
}

export function SearchHighlight({
  text,
  className,
  highlightClassName = 'rounded bg-primary-100 text-primary-900',
}: SearchHighlightProps) {
  if (!text) {
    return null;
  }

  const tokens = parseHighlightedText(text);

  return (
    <span className={className}>
      {tokens.map((token, index) =>
        token.highlighted ? (
          <mark key={index} className={highlightClassName}>
            {token.text}
          </mark>
        ) : (
          <Fragment key={index}>{token.text}</Fragment>
        )
      )}
    </span>
  );
}
