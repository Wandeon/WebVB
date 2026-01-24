import { describe, expect, it } from 'vitest';

import { fadeIn, fadeInUp, scaleIn, staggerChildren } from './index';

describe('animation presets', () => {
  it('defines fadeIn with expected duration', () => {
    expect(fadeIn).toMatchObject({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.25 },
    });
  });

  it('defines fadeInUp with easing', () => {
    expect(fadeInUp).toMatchObject({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    });
  });

  it('defines scaleIn preset', () => {
    expect(scaleIn).toMatchObject({
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2 },
    });
  });

  it('defines staggerChildren preset', () => {
    expect(staggerChildren).toMatchObject({
      animate: { transition: { staggerChildren: 0.05 } },
    });
  });
});
