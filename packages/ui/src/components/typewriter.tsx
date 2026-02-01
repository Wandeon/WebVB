'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  cursor = true,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    setHasStarted(false);

    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    }

    setIsComplete(true);
    onComplete?.();
    return undefined;
  }, [displayedText, text, speed, hasStarted, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="ml-0.5"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

interface TypewriterFactProps {
  label: string;
  value: string;
  delay?: number;
  onComplete?: () => void;
}

export function TypewriterFact({ label, value, delay = 0, onComplete }: TypewriterFactProps) {
  const [showValue, setShowValue] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      className="flex items-baseline gap-2"
    >
      <span className="text-sm font-medium text-white/70 uppercase tracking-wider">
        {label}
      </span>
      <AnimatePresence mode="wait">
        {!showValue ? (
          <motion.span
            key="typing-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
              setTimeout(() => setShowValue(true), delay + 200);
            }}
          />
        ) : (
          <motion.span
            key="value"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold text-white"
          >
            <Typewriter
              text={value}
              speed={40}
              delay={0}
              cursor={false}
              {...(onComplete ? { onComplete } : {})}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
