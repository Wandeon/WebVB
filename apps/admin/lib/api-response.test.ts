import { describe, expect, it } from 'vitest';

import { apiError, apiSuccess, ErrorCodes } from './api-response';

interface TestData {
  id: string;
  name?: string;
  created?: boolean;
}

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

interface SuccessBody<T> {
  success: true;
  data: T;
}

describe('apiSuccess', () => {
  it('returns success response with data', async () => {
    const data = { id: '123', name: 'Test' };
    const response = apiSuccess(data);

    expect(response.status).toBe(200);

    const body = (await response.json()) as SuccessBody<TestData>;
    expect(body).toEqual({
      success: true,
      data: { id: '123', name: 'Test' },
    });
  });

  it('allows custom status code', async () => {
    const data = { id: '1', created: true };
    const response = apiSuccess(data, 201);

    expect(response.status).toBe(201);

    const body = (await response.json()) as SuccessBody<TestData>;
    expect(body).toEqual({
      success: true,
      data: { id: '1', created: true },
    });
  });

  it('handles array data', async () => {
    const data = [{ id: '1' }, { id: '2' }];
    const response = apiSuccess(data);

    const body = (await response.json()) as SuccessBody<TestData[]>;
    expect(body).toEqual({
      success: true,
      data: [{ id: '1' }, { id: '2' }],
    });
  });

  it('handles null data', async () => {
    const response = apiSuccess(null);

    const body = (await response.json()) as SuccessBody<null>;
    expect(body).toEqual({
      success: true,
      data: null,
    });
  });
});

describe('apiError', () => {
  it('returns error response with code and message', async () => {
    const response = apiError('VALIDATION_ERROR', 'Invalid input');

    expect(response.status).toBe(400);

    const body = (await response.json()) as ErrorBody;
    expect(body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      },
    });
  });

  it('allows custom status code', async () => {
    const response = apiError('NOT_FOUND', 'Resource not found', 404);

    expect(response.status).toBe(404);

    const body = (await response.json()) as ErrorBody;
    expect(body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
  });

  it('includes optional details', async () => {
    const response = apiError('VALIDATION_ERROR', 'Invalid input', 400, {
      field: 'title',
      received: '',
    });

    const body = (await response.json()) as ErrorBody;
    expect(body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: {
          field: 'title',
          received: '',
        },
      },
    });
  });

  it('omits details when not provided', async () => {
    const response = apiError('INTERNAL_ERROR', 'Something went wrong', 500);

    const body = (await response.json()) as ErrorBody;
    expect(body.error).not.toHaveProperty('details');
  });
});

describe('ErrorCodes', () => {
  it('has all expected error codes', () => {
    expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
  });
});
