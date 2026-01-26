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

  return env.NODE_ENV === 'development' && allowEmpty && !isCi;
}

export function withStaticParams<TParams extends Record<string, string | string[]>>(
  factory: StaticParamsFactory<TParams>,
  options: StaticParamsOptions
) {
  return async () => {
    try {
      // Debug: Log DATABASE_URL availability
      const dbUrl = process.env.DATABASE_URL;
      // eslint-disable-next-line no-console
      console.log(`[withStaticParams:${options.routeName}] DATABASE_URL set: ${!!dbUrl}, length: ${dbUrl?.length ?? 0}`);

      const result = await factory();
      // eslint-disable-next-line no-console
      console.log(`[withStaticParams:${options.routeName}] Generated ${result.length} params`);
      return result;
    } catch (error) {
      // Debug: Log the actual error
      // eslint-disable-next-line no-console
      console.error(`[withStaticParams:${options.routeName}] ERROR:`, error);

      if (shouldAllowEmptyParams()) {
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
