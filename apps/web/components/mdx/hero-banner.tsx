'use client';

import { FadeIn } from '@repo/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';

import type { ReactNode } from 'react';

export interface HeroBannerProps {
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  overlay?: 'light' | 'dark' | 'gradient';
  height?: 'small' | 'medium' | 'large';
  children?: ReactNode;
}

const overlayStyles = {
  light: 'bg-white/30',
  dark: 'bg-black/50',
  gradient: 'bg-gradient-to-t from-black/70 via-black/30 to-transparent',
};

const heightStyles = {
  small: 'min-h-[250px] md:min-h-[300px]',
  medium: 'min-h-[350px] md:min-h-[450px]',
  large: 'min-h-[450px] md:min-h-[550px]',
};

export function HeroBanner({
  title,
  subtitle,
  image,
  imageAlt = '',
  overlay = 'gradient',
  height = 'medium',
  children,
}: HeroBannerProps) {
  return (
    <section className={`relative w-full overflow-hidden ${heightStyles[height]}`}>
      <Image
        src={image}
        alt={imageAlt || title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className={`absolute inset-0 ${overlayStyles[overlay]}`} />

      <div className="container relative mx-auto flex h-full min-h-[inherit] flex-col justify-end px-4 pb-12 pt-24 md:pb-16">
        <FadeIn>
          <motion.h1
            className="max-w-3xl font-display text-4xl font-bold text-white drop-shadow-lg md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
          {children && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
