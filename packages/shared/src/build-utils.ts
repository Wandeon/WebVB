import { getBuildEnv } from './env';

interface StaticParamsOptions<TParams> {
  routeName: string;
  /** Placeholder param to use when result is empty in CI builds */
  placeholder?: TParams;
}

type StaticParamsFactory<TParams extends Record<string, string | string[]>> = () => Promise<TParams[]>;

const ALLOW_EMPTY_STATIC_PARAMS_VALUES = new Set(['true', '1']);

function shouldAllowEmptyParams(): boolean {
  const env = getBuildEnv();
  const allowEmpty = ALLOW_EMPTY_STATIC_PARAMS_VALUES.has(
    env.ALLOW_EMPTY_STATIC_PARAMS ?? ''
  );
  const isCi = Boolean(env.CI) && env.CI !== 'false';

  // Allow empty params in CI when explicitly enabled (for builds without seed data)
  if (isCi && allowEmpty) {
    return true;
  }

  // Allow in development when explicitly enabled
  return env.NODE_ENV === 'development' && allowEmpty;
}

export function withStaticParams<TParams extends Record<string, string | string[]>>(
  factory: StaticParamsFactory<TParams>,
  options: StaticParamsOptions<TParams>
) {
  return async () => {
    try {
      const result = await factory();
      // If empty and allowed and placeholder provided, return placeholder
      // This satisfies Next.js static export which requires at least one param
      if (result.length === 0 && shouldAllowEmptyParams() && options.placeholder) {
        return [options.placeholder];
      }
      return result;
    } catch (error) {
      if (shouldAllowEmptyParams()) {
        // If placeholder provided, return it; otherwise return empty array
        // (empty array works for dev, placeholder needed for CI static export)
        return options.placeholder ? [options.placeholder] : [];
      }

      const details =
        error instanceof Error ? error.message : 'Nepoznata greška';
      const message = [
        `Neuspjelo generiranje statičkih ruta za ${options.routeName}.`,
        'Provjerite da je baza podataka dostupna tijekom builda.',
        'Za lokalni razvoj možete postaviti ALLOW_EMPTY_STATIC_PARAMS=true.',
        `Izvorna greška: ${details}`,
      ].join(' ');

      throw new Error(message);
    }
  };
}
