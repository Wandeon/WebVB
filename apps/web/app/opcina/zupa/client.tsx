'use client';

import { ArticleContent } from '@repo/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, MapPin, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface TabPage {
  id: string;
  title: string;
  slug: string;
  content: string;
}

interface ZupaClientProps {
  pages: TabPage[];
}

// Hero images for each tab
const heroImages: Record<string, string> = {
  crkva: '/images/hero/veliki-bukovec-hero-1.jpg',
  'crkve-i-kapelice': '/images/hero/veliki-bukovec-hero-2.jpg',
  'zupni-ured': '/images/hero/veliki-bukovec-hero-3.jpg',
  groblja: '/images/hero/veliki-bukovec-hero-1.jpg',
  'opcinsko-groblje': '/images/hero/veliki-bukovec-hero-2.jpg',
};

export function ZupaClient({ pages }: ZupaClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (pages.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Nema dostupnog sadržaja.</p>
      </div>
    );
  }

  const activePage = pages[activeIndex]!;
  const activeSlugKey = activePage.slug.split('/').pop() ?? '';
  const heroImage = heroImages[activeSlugKey] ?? '/images/hero/veliki-bukovec-hero-1.jpg';

  return (
    <div className="min-h-screen bg-white">
      {/* Tab Bar - Sticky */}
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center overflow-x-auto">
            {pages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => setActiveIndex(index)}
                className="relative whitespace-nowrap px-3 py-4 text-sm font-medium transition-colors sm:px-6 sm:text-base"
              >
                <span
                  className={
                    activeIndex === index
                      ? 'text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }
                >
                  {page.title}
                </span>
                {activeIndex === index && (
                  <motion.div
                    layoutId="activeZupaTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden sm:h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImage}
              alt={activePage.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 sm:pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Church className="h-6 w-6 text-white/80" />
                  <span className="text-sm font-medium text-white/80">
                    Župa sv. Franje Asiškog
                  </span>
                </div>
                <h1 className="font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                  {activePage.title}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-white/60" />
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-4xl"
          >
            <ArticleContent content={activePage.content} className="prose-lg" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info Card */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
              <MapPin className="h-5 w-5 text-primary-600" />
              Kontakt župe
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-neutral-500">Adresa</dt>
                <dd className="font-medium text-neutral-900">
                  Trg sv. Franje 1, 42231 Veliki Bukovec
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Telefon</dt>
                <dd className="font-medium text-neutral-900">042/769-000</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
