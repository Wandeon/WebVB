import Image from 'next/image';
import Link from 'next/link';

import { ContactBlock } from '@/components/mdx/contact-block';
import { CTASection } from '@/components/mdx/cta-section';
import { FeatureSection } from '@/components/mdx/feature-section';
import { HeroBanner } from '@/components/mdx/hero-banner';
import { InfoBox } from '@/components/mdx/info-box';
import { BentoCard, BentoGrid, LinkCard, LinkCardGrid } from '@/components/mdx/link-card';
import { PhotoShowcase } from '@/components/mdx/photo-showcase';
import { Stat, StatsRow } from '@/components/mdx/stats-row';
import { Table } from '@/components/mdx/table';
import { Timeline, TimelineItem } from '@/components/mdx/timeline';

import type { MDXComponents } from 'mdx/types';
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

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

    // Table styling
    table: ({ children, ...props }: HTMLAttributes<HTMLTableElement>) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200">
        <table
          className="w-full border-collapse text-left text-sm"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className="bg-neutral-50" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody className="divide-y divide-neutral-200" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
      <tr className="hover:bg-neutral-50 transition-colors" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) => (
      <th
        className="px-4 py-3 font-semibold text-neutral-900 border-b border-neutral-200"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
      <td className="px-4 py-3 text-neutral-600" {...props}>
        {children}
      </td>
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
    Table,

    ...components,
  };
}
