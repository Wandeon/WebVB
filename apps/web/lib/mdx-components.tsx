import Image from 'next/image';
import Link from 'next/link';

import { ContactBlock } from '@/components/mdx/contact-block';
import { CTASection } from '@/components/mdx/cta-section';
import { FeatureSection } from '@/components/mdx/feature-section';
import { HeroBanner } from '@/components/mdx/hero-banner';
import { InfoBox } from '@/components/mdx/info-box';
import { LinkCard, LinkCardGrid } from '@/components/mdx/link-card';
import { PhotoShowcase } from '@/components/mdx/photo-showcase';
import { Stat, StatsRow } from '@/components/mdx/stats-row';
import { Timeline, TimelineItem } from '@/components/mdx/timeline';

import type { MDXComponents } from 'mdx/types';
import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Standard HTML overrides
    a: ({
      href,
      children,
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) => {
      if (href?.startsWith('/')) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    img: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => (
      <Image
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        width={800}
        height={450}
        className="rounded-xl shadow-lg"
      />
    ),

    // Custom MDX Components - Import these in MDX files
    HeroBanner,
    LinkCard,
    LinkCardGrid,
    FeatureSection,
    InfoBox,
    StatsRow,
    Stat,
    Timeline,
    TimelineItem,
    PhotoShowcase,
    CTASection,
    ContactBlock,

    ...components,
  };
}
