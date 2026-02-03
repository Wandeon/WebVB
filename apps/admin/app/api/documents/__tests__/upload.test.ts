import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies before importing the route
vi.mock('@/lib/logger', () => ({
  documentsLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/r2', () => ({
  uploadToR2: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/audit-log', () => ({
  createAuditLog: vi.fn(),
}));

// Import mocked modules
import { requireAuth } from '@/lib/api-auth';
import { createAuditLog } from '@/lib/audit-log';
import { documentsLogger } from '@/lib/logger';
import { uploadToR2 } from '@/lib/r2';

// Now import the route handler (after mocks are set up)
import { POST } from '../upload/route';

const mockedUploadToR2 = vi.mocked(uploadToR2);
const mockedLoggerInfo = vi.mocked(documentsLogger.info);
const mockedLoggerWarn = vi.mocked(documentsLogger.warn);
const mockedLoggerError = vi.mocked(documentsLogger.error);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedCreateAuditLog = vi.mocked(createAuditLog);

// UUID regex pattern for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper to create a File object with specific content
function createMockFile(
  content: string | ArrayBuffer,
  filename: string,
  type: string
): File {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
}

// Helper to create a Request with FormData
function createUploadRequest(file: File | null): Request {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  return new Request('http://localhost:3000/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

interface UploadResult {
  id: string;
  fileUrl: string;
  fileSize: number;
}

describe('POST /api/documents/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'user-1', role: 'staff' } },
        role: 'staff',
        userId: 'user-1',
      },
    });
  });

  it('uploads valid PDF file', async () => {
    // Create a file with valid PDF signature
    const pdfContent = '%PDF-1.4 mock pdf content here';
    const file = createMockFile(pdfContent, 'document.pdf', 'application/pdf');

    // Mock uploadToR2 to return a URL based on the key passed to it
    mockedUploadToR2.mockImplementation((key: string) => {
      return Promise.resolve(`https://r2.example.com/${key}`);
    });

    const request = createUploadRequest(file);
    const response = await POST(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as ApiSuccessResponse<UploadResult>;

    expect(body.success).toBe(true);
    expect(body.data.id).toMatch(UUID_REGEX);
    expect(body.data.fileUrl).toContain('documents/');
    expect(body.data.fileUrl).toContain('.pdf');
    expect(body.data.fileSize).toBe(file.size);

    expect(mockedUploadToR2).toHaveBeenCalledWith(
      expect.stringMatching(/^documents\/[0-9a-f-]+\.pdf$/),
      expect.any(Buffer),
      'application/pdf'
    );

    expect(mockedCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
        entityType: 'document',
      })
    );

    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: expect.stringMatching(UUID_REGEX) as string,
        size: file.size,
      }),
      'Document uploaded successfully'
    );
  });

  it('rejects non-PDF by signature (file claims PDF type but wrong signature)', async () => {
    // File has application/pdf MIME type but doesn't have PDF signature
    const fakeContent = 'This is not a PDF file, just plain text';
    const file = createMockFile(fakeContent, 'fake.pdf', 'application/pdf');

    const request = createUploadRequest(file);
    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Datoteka nije valjani PDF');

    expect(mockedUploadToR2).not.toHaveBeenCalled();
    // File name may be 'blob' in test environment due to FormData handling
    expect(mockedLoggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Vitest matcher
        fileName: expect.objectContaining({
          textHash: expect.any(String) as string,
          textLength: expect.any(Number) as number,
        }),
      }),
      'Invalid PDF file'
    );
  });

  it('rejects missing file', async () => {
    const request = createUploadRequest(null);
    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Datoteka nije odabrana');

    expect(mockedUploadToR2).not.toHaveBeenCalled();
  });

  it('handles R2 upload failure gracefully', async () => {
    const pdfContent = '%PDF-1.4 mock pdf content';
    const file = createMockFile(pdfContent, 'document.pdf', 'application/pdf');

    mockedUploadToR2.mockRejectedValue(new Error('R2 upload failed: network error'));

    const request = createUploadRequest(file);
    const response = await POST(request);

    expect(response.status).toBe(500);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    // The actual error message has Croatian characters
    expect(body.error.message).toContain('Gre');

    expect(mockedLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) as Error }),
      'Failed to upload document'
    );
  });

  it('rejects file with incorrect MIME type', async () => {
    // File has text/plain MIME type
    const textContent = '%PDF-1.4 looks like pdf but has wrong mime';
    const file = createMockFile(textContent, 'document.txt', 'text/plain');

    const request = createUploadRequest(file);
    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Datoteka nije valjani PDF');

    expect(mockedUploadToR2).not.toHaveBeenCalled();
    // File name may be 'blob' in test environment due to FormData handling
    expect(mockedLoggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({ mimeType: 'text/plain' }),
      'Invalid MIME type'
    );
  });

  // Note: Testing file size limits in unit tests is challenging because:
  // 1. The File API in test environments doesn't easily support mocking size
  // 2. Creating a 20MB+ file in memory for tests is inefficient
  // The file size validation is better tested in integration/e2e tests.
  // The "rejects missing file" test above already verifies the validation error response structure.
});
