import { describe, expect, it } from 'vitest';

import { serializeError } from './logger';

describe('serializeError', () => {
  it('serializes Error instances without stack traces', () => {
    const error = new Error('Neuspjeh') as Error & { code?: string };
    error.code = 'E_FAIL';

    const result = serializeError(error);

    expect(result).toEqual({
      name: 'Error',
      message: 'Neuspjeh',
      code: 'E_FAIL',
    });
    expect(result).not.toHaveProperty('stack');
  });

  it('serializes error-like objects', () => {
    const errorLike = { message: 'Oops', code: 'E_CUSTOM' };

    expect(serializeError(errorLike)).toEqual({
      message: 'Oops',
      code: 'E_CUSTOM',
    });
  });

  it('serializes primitives as message strings', () => {
    expect(serializeError('fail')).toEqual({ message: 'fail' });
  });
});
