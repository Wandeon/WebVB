/**
 * Document parser utility for extracting text from PDF, DOCX, and images
 * Uses pdf-parse for PDFs, mammoth for DOCX, and tesseract.js for OCR
 */

import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';

import { aiLogger } from '../logger';

// =============================================================================
// Types
// =============================================================================

export interface ParseSuccessResult {
  success: true;
  text: string;
  wordCount: number;
  pageCount?: number;
}

export interface ParseFailureResult {
  success: false;
  error: string;
}

export type ParseResult = ParseSuccessResult | ParseFailureResult;

// =============================================================================
// Constants
// =============================================================================

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

const MAX_TEXT_LENGTH = 8000;
const MIN_PDF_TEXT_LENGTH = 50; // Threshold to detect scanned PDFs
const MAX_BUFFER_BYTES = 10 * 1024 * 1024; // 10MB safety limit
const MAX_PDF_PAGES = 50;
const PDF_PARSE_TIMEOUT_MS = 20000;
const DOCX_PARSE_TIMEOUT_MS = 15000;
const OCR_TIMEOUT_MS = 60000;

// =============================================================================
// Timeout Helper
// =============================================================================

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Clean text by normalizing whitespace and removing excessive newlines
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/ +/g, ' ') // Collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n') // Collapse 3+ newlines to 2
    .trim();
}

/**
 * Truncate text to maximum length, breaking at word boundary
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// =============================================================================
// Parsers
// =============================================================================

/**
 * Parse PDF document
 * Falls back to OCR if PDF has no extractable text (scanned document)
 */
async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  let parser: PDFParse | null = null;

  try {
    parser = new PDFParse({ data: buffer });
    const textResult = await withTimeout(
      parser.getText(),
      PDF_PARSE_TIMEOUT_MS,
      'PDF obrada je predugo trajala'
    );
    let text = cleanText(textResult.text);
    const pageCount = textResult.total;

    if (pageCount > MAX_PDF_PAGES) {
      return {
        success: false,
        error: `PDF ima ${pageCount} stranica, maksimalno je ${MAX_PDF_PAGES}`,
      };
    }

    // If PDF has very little text, it might be a scanned document
    if (text.length < MIN_PDF_TEXT_LENGTH) {
      aiLogger.info('PDF has minimal text, attempting OCR fallback');
      // For scanned PDFs, we would need to render pages to images first
      // This is complex, so for now we return what we have with a note
      if (text.length === 0) {
        return {
          success: false,
          error: 'PDF izgleda kao skenirani dokument. OCR obrada PDF stranica još nije podržana.',
        };
      }
    }

    text = truncateText(text, MAX_TEXT_LENGTH);

    return {
      success: true,
      text,
      wordCount: countWords(text),
      pageCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error parsing PDF';
    aiLogger.error({ error }, 'Failed to parse PDF');
    return {
      success: false,
      error: `Neuspjela obrada PDF dokumenta: ${message}`,
    };
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

/**
 * Parse DOCX document
 */
async function parseDocx(buffer: Buffer): Promise<ParseResult> {
  try {
    const result = await withTimeout(
      mammoth.extractRawText({ buffer }),
      DOCX_PARSE_TIMEOUT_MS,
      'DOCX obrada je predugo trajala'
    );
    let text = cleanText(result.value);

    if (result.messages.length > 0) {
      aiLogger.warn({ messages: result.messages }, 'DOCX parsing warnings');
    }

    if (text.length === 0) {
      return {
        success: false,
        error: 'DOCX dokument ne sadrži prepoznatljiv tekst',
      };
    }

    text = truncateText(text, MAX_TEXT_LENGTH);

    return {
      success: true,
      text,
      wordCount: countWords(text),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error parsing DOCX';
    aiLogger.error({ error }, 'Failed to parse DOCX');
    return {
      success: false,
      error: `Neuspjela obrada DOCX dokumenta: ${message}`,
    };
  }
}

/**
 * Parse image using OCR (tesseract.js)
 * Uses Croatian + English language pack
 */
async function parseImage(buffer: Buffer): Promise<ParseResult> {
  try {
    aiLogger.info('Starting OCR processing');

    const { data } = await withTimeout(
      Tesseract.recognize(buffer, 'hrv+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && m.progress) {
            aiLogger.debug({ progress: Math.round(m.progress * 100) }, 'OCR progress');
          }
        },
      }),
      OCR_TIMEOUT_MS,
      'OCR obrada je predugo trajala'
    );

    let text = cleanText(data.text);

    if (text.length === 0) {
      return {
        success: false,
        error: 'OCR nije pronašao prepoznatljiv tekst na slici',
      };
    }

    text = truncateText(text, MAX_TEXT_LENGTH);

    aiLogger.info({ confidence: data.confidence, wordCount: countWords(text) }, 'OCR completed');

    return {
      success: true,
      text,
      wordCount: countWords(text),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during OCR';
    aiLogger.error({ error }, 'Failed to perform OCR');
    return {
      success: false,
      error: `Neuspjela OCR obrada slike: ${message}`,
    };
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Check if a MIME type is supported for document parsing
 */
export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType);
}

/**
 * Get list of all supported MIME types
 */
export function getSupportedMimeTypes(): readonly string[] {
  return SUPPORTED_MIME_TYPES;
}

/**
 * Parse a document and extract text
 * @param buffer - The document content as a Buffer
 * @param mimeType - The MIME type of the document
 * @returns ParseResult with extracted text or error
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<ParseResult> {
  if (buffer.length > MAX_BUFFER_BYTES) {
    return {
      success: false,
      error: `Dokument je prevelik za obradu (maks ${MAX_BUFFER_BYTES / (1024 * 1024)}MB)`,
    };
  }

  if (!isSupportedMimeType(mimeType)) {
    return {
      success: false,
      error: `Nepodržani tip dokumenta: ${mimeType}`,
    };
  }

  aiLogger.info({ mimeType, size: buffer.length }, 'Parsing document');

  switch (mimeType) {
    case 'application/pdf':
      return parsePdf(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDocx(buffer);

    case 'image/jpeg':
    case 'image/png':
      return parseImage(buffer);

    default:
      // This should never happen due to the type guard above
      return {
        success: false,
        error: `Nepodržani tip dokumenta: ${String(mimeType)}`,
      };
  }
}
