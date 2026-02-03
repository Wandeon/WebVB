import { getBuildEnv, getOptionalDatabaseEnv } from '@repo/shared';

const ALLOW_EMPTY_STATIC_PARAMS_VALUES = new Set(['true', '1']);

export function shouldSkipDatabase(): boolean {
  const buildEnv = getBuildEnv();
  const allowEmpty = ALLOW_EMPTY_STATIC_PARAMS_VALUES.has(
    buildEnv.ALLOW_EMPTY_STATIC_PARAMS ?? ''
  );
  const isCi = Boolean(buildEnv.CI) && buildEnv.CI !== 'false';
  const isEligibleEnv = isCi || buildEnv.NODE_ENV === 'development';

  if (!allowEmpty || !isEligibleEnv) {
    return false;
  }

  return getOptionalDatabaseEnv() === null;
}
