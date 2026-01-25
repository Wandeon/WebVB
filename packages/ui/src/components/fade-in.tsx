'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { cn } from '../lib/utils';

export interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  once?: boolean;
}

const directionVariants = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionVariants[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
