// apps/web/components/small-hero.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SmallHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}

export function SmallHero({ title, subtitle, image, imageAlt }: SmallHeroProps) {
  const hasImage = !!image;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-xl ${
        hasImage ? 'h-[200px] md:h-[250px]' : 'bg-gradient-to-br from-primary-600 to-primary-700 py-10'
      }`}
    >
      {hasImage && (
        <>
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
        </>
      )}

      <div
        className={`relative flex h-full flex-col justify-end ${
          hasImage ? 'p-6 md:p-8' : 'px-6 md:px-8'
        }`}
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-2xl font-bold text-white md:text-3xl"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-sm text-white/80 md:text-base"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}
