import { getBuildEnv } from './env';

interface StaticParamsOptions {
  routeName: string;
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
  options: StaticParamsOptions
) {
  return async () => {
    // eslint-disable-next-line no-console
    console.log(`[withStaticParams:${options.routeName}] Starting, ALLOW_EMPTY=${process.env.ALLOW_EMPTY_STATIC_PARAMS}, CI=${process.env.CI}`);
    try {
      const result = await factory();
      // eslint-disable-next-line no-console
      console.log(`[withStaticParams:${options.routeName}] Success, returning ${result.length} params`);
      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`[withStaticParams:${options.routeName}] Error caught, shouldAllow=${shouldAllowEmptyParams()}`);
      // eslint-disable-next-line no-console
      console.error(`[withStaticParams:${options.routeName}] Error:`, error);

      if (shouldAllowEmptyParams()) {
        // eslint-disable-next-line no-console
        console.log(`[withStaticParams:${options.routeName}] Returning empty array`);
        return [];
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
