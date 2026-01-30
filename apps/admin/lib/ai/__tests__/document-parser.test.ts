import { describe, expect, it, vi, beforeEach } from 'vitest';
import type Tesseract from 'tesseract.js';

// Hoist mock functions so they can be referenced in vi.mock
const { mockGetText, mockDestroy, mockExtractRawText, mockRecognize } = vi.hoisted(() => ({
  mockGetText: vi.fn(),
  mockDestroy: vi.fn().mockResolvedValue(undefined),
  mockExtractRawText: vi.fn(),
  mockRecognize: vi.fn(),
}));

// Mock the external dependencies
vi.mock('pdf-parse', () => {
  return {
    PDFParse: class MockPDFParse {
      getText = mockGetText;
      destroy = mockDestroy;
    },
  };
});

vi.mock('mammoth', () => ({
  default: {
    extractRawText: mockExtractRawText,
  },
}));

vi.mock('tesseract.js', () => ({
  default: {
    recognize: mockRecognize,
  },
}));

import {
  getSupportedMimeTypes,
  isSupportedMimeType,
  parseDocument,
} from '../document-parser';

describe('document-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isSupportedMimeType', () => {
    it('returns true for application/pdf', () => {
      expect(isSupportedMimeType('application/pdf')).toBe(true);
    });

    it('returns true for DOCX mime type', () => {
      expect(
        isSupportedMimeType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe(true);
    });

    it('returns true for image/jpeg', () => {
      expect(isSupportedMimeType('image/jpeg')).toBe(true);
    });

    it('returns true for image/png', () => {
      expect(isSupportedMimeType('image/png')).toBe(true);
    });

    it('returns false for text/plain', () => {
      expect(isSupportedMimeType('text/plain')).toBe(false);
    });

    it('returns false for application/json', () => {
      expect(isSupportedMimeType('application/json')).toBe(false);
    });

    it('returns false for image/gif', () => {
      expect(isSupportedMimeType('image/gif')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isSupportedMimeType('')).toBe(false);
    });
  });

  describe('getSupportedMimeTypes', () => {
    it('returns all 4 supported mime types', () => {
      const mimeTypes = getSupportedMimeTypes();
      expect(mimeTypes).toHaveLength(4);
    });

    it('includes application/pdf', () => {
      const mimeTypes = getSupportedMimeTypes();
      expect(mimeTypes).toContain('application/pdf');
    });

    it('includes DOCX mime type', () => {
      const mimeTypes = getSupportedMimeTypes();
      expect(mimeTypes).toContain(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    });

    it('includes image/jpeg', () => {
      const mimeTypes = getSupportedMimeTypes();
      expect(mimeTypes).toContain('image/jpeg');
    });

    it('includes image/png', () => {
      const mimeTypes = getSupportedMimeTypes();
      expect(mimeTypes).toContain('image/png');
    });
  });

  describe('parseDocument', () => {
    describe('unsupported types', () => {
      it('returns error for unsupported mime type', async () => {
        const buffer = Buffer.from('test content');
        const result = await parseDocument(buffer, 'text/plain');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Unsupported document type');
        }
      });
    });

    describe('PDF parsing', () => {
      it('successfully parses PDF with text', async () => {
        mockGetText.mockResolvedValueOnce({
          text: 'Hello world from PDF document',
          total: 2,
          pages: [],
          getPageText: () => '',
        });

        const buffer = Buffer.from('fake pdf content');
        const result = await parseDocument(buffer, 'application/pdf');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toBe('Hello world from PDF document');
          expect(result.wordCount).toBe(5);
          expect(result.pageCount).toBe(2);
        }
      });

      it('returns error for empty PDF', async () => {
        mockGetText.mockResolvedValueOnce({
          text: '',
          total: 1,
          pages: [],
          getPageText: () => '',
        });

        const buffer = Buffer.from('fake pdf content');
        const result = await parseDocument(buffer, 'application/pdf');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('scanned/image-based');
        }
      });

      it('handles PDF parsing errors', async () => {
        mockGetText.mockRejectedValueOnce(new Error('Corrupted PDF'));

        const buffer = Buffer.from('corrupted pdf');
        const result = await parseDocument(buffer, 'application/pdf');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Failed to parse PDF');
        }
      });
    });

    describe('DOCX parsing', () => {
      it('successfully parses DOCX document', async () => {
        mockExtractRawText.mockResolvedValueOnce({
          value: 'Hello world from Word document',
          messages: [],
        });

        const buffer = Buffer.from('fake docx content');
        const result = await parseDocument(
          buffer,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toBe('Hello world from Word document');
          expect(result.wordCount).toBe(5);
          expect(result.pageCount).toBeUndefined();
        }
      });

      it('returns error for empty DOCX', async () => {
        mockExtractRawText.mockResolvedValueOnce({
          value: '',
          messages: [],
        });

        const buffer = Buffer.from('fake docx content');
        const result = await parseDocument(
          buffer,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('no extractable text');
        }
      });

      it('handles DOCX parsing errors', async () => {
        mockExtractRawText.mockRejectedValueOnce(new Error('Invalid DOCX'));

        const buffer = Buffer.from('invalid docx');
        const result = await parseDocument(
          buffer,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Failed to parse DOCX');
        }
      });
    });

    describe('Image OCR', () => {
      it('successfully extracts text from JPEG image', async () => {
        mockRecognize.mockResolvedValueOnce({
          data: {
            text: 'Text extracted from image',
            confidence: 85,
          },
        } as Awaited<ReturnType<typeof Tesseract.recognize>>);

        const buffer = Buffer.from('fake jpeg content');
        const result = await parseDocument(buffer, 'image/jpeg');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toBe('Text extracted from image');
          expect(result.wordCount).toBe(4);
        }
      });

      it('successfully extracts text from PNG image', async () => {
        mockRecognize.mockResolvedValueOnce({
          data: {
            text: 'PNG image text content here',
            confidence: 90,
          },
        } as Awaited<ReturnType<typeof Tesseract.recognize>>);

        const buffer = Buffer.from('fake png content');
        const result = await parseDocument(buffer, 'image/png');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toBe('PNG image text content here');
          expect(result.wordCount).toBe(5);
        }
      });

      it('returns error when OCR extracts no text', async () => {
        mockRecognize.mockResolvedValueOnce({
          data: {
            text: '',
            confidence: 0,
          },
        } as Awaited<ReturnType<typeof Tesseract.recognize>>);

        const buffer = Buffer.from('blank image');
        const result = await parseDocument(buffer, 'image/jpeg');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('No text could be extracted');
        }
      });

      it('handles OCR errors', async () => {
        mockRecognize.mockRejectedValueOnce(new Error('OCR failed'));

        const buffer = Buffer.from('corrupted image');
        const result = await parseDocument(buffer, 'image/png');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Failed to extract text from image');
        }
      });
    });

    describe('text processing', () => {
      it('cleans excessive whitespace', async () => {
        mockGetText.mockResolvedValueOnce({
          text: 'Hello    world\t\twith   extra   spaces',
          total: 1,
          pages: [],
          getPageText: () => '',
        });

        const buffer = Buffer.from('fake pdf');
        const result = await parseDocument(buffer, 'application/pdf');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toBe('Hello world with extra spaces');
        }
      });

      it('normalizes multiple newlines', async () => {
        mockGetText.mockResolvedValueOnce({
          text: 'Paragraph one\n\n\n\n\nParagraph two',
          total: 1,
          pages: [],
          getPageText: () => '',
        });

        const buffer = Buffer.from('fake pdf');
        const result = await parseDocument(buffer, 'application/pdf');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toBe('Paragraph one\n\nParagraph two');
        }
      });

      it('truncates text exceeding max length', async () => {
        const longText = 'word '.repeat(2000); // ~10000 characters
        mockGetText.mockResolvedValueOnce({
          text: longText,
          total: 5,
          pages: [],
          getPageText: () => '',
        });

        const buffer = Buffer.from('fake pdf');
        const result = await parseDocument(buffer, 'application/pdf');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text.length).toBeLessThanOrEqual(8003); // 8000 + "..."
          expect(result.text.endsWith('...')).toBe(true);
        }
      });
    });
  });
});
