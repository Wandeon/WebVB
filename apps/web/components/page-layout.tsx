'use client';

import { FadeIn } from '@repo/ui';
import { ChevronRight, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  section?: string;
  heroImage?: string;
  heroImageAlt?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
}

const sectionLabels: Record<string, string> = {
  organizacija: 'Organizacija',
  'rad-uprave': 'Rad uprave',
  opcina: 'Općina',
  dokumenti: 'Dokumenti',
};

export function PageLayout({
  title,
  subtitle,
  section,
  heroImage,
  heroImageAlt,
  breadcrumbs,
  children,
}: PageLayoutProps) {
  // Auto-generate breadcrumbs if not provided
  const crumbs: BreadcrumbItem[] = breadcrumbs || [
    ...(section
      ? [{ label: sectionLabels[section] || section, href: `/${section}` }]
      : []),
    { label: title },
  ];

  const hasHeroImage = !!heroImage;

  return (
    <>
      {/* Hero Section */}
      <FadeIn>
        <section
          className={`relative overflow-hidden ${
            hasHeroImage
              ? 'min-h-[300px] md:min-h-[400px]'
              : 'py-12 md:py-16'
          } ${hasHeroImage ? '' : 'bg-gradient-to-br from-primary-600 to-primary-800'}`}
        >
          {hasHeroImage && (
            <>
              <Image
                src={heroImage}
                alt={heroImageAlt || title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
            </>
          )}

          <div
            className={`container relative mx-auto px-4 ${
              hasHeroImage ? 'flex min-h-[300px] flex-col justify-end pb-10 pt-20 md:min-h-[400px] md:pb-12' : ''
            }`}
          >
            {/* Breadcrumbs */}
            <nav className="mb-4 flex items-center gap-1 text-sm" aria-label="Breadcrumb">
              <Link
                href="/"
                className={`flex items-center transition-colors ${
                  hasHeroImage
                    ? 'text-white/70 hover:text-white'
                    : 'text-primary-200 hover:text-white'
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Početna</span>
              </Link>
              {crumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  <ChevronRight
                    className={`h-4 w-4 ${
                      hasHeroImage ? 'text-white/50' : 'text-primary-300'
                    }`}
                  />
                  {crumb.href && index < crumbs.length - 1 ? (
                    <Link
                      href={crumb.href}
                      className={`transition-colors ${
                        hasHeroImage
                          ? 'text-white/70 hover:text-white'
                          : 'text-primary-200 hover:text-white'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        hasHeroImage ? 'text-white font-medium' : 'text-white font-medium'
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>

            {/* Title */}
            <h1
              className={`font-display text-3xl font-bold md:text-4xl lg:text-5xl ${
                hasHeroImage ? 'text-white drop-shadow-lg' : 'text-white'
              }`}
            >
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p
                className={`mt-3 max-w-2xl text-lg ${
                  hasHeroImage ? 'text-white/90' : 'text-primary-100'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </section>
      </FadeIn>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <article className="prose prose-neutral mx-auto max-w-4xl prose-headings:font-display prose-headings:font-semibold prose-h2:mt-10 prose-h2:text-2xl prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-3 prose-h3:mt-8 prose-p:text-neutral-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-li:text-neutral-600">
          {children}
        </article>
      </div>
    </>
  );
}
