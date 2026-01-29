'use client';

import { FadeIn } from '@repo/ui';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import type { ReactNode } from 'react';

export interface CTASectionProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
    external?: boolean;
  };
  secondaryAction?: {
    label: string;
    href: string;
    external?: boolean;
  };
  variant?: 'default' | 'primary' | 'subtle';
  children?: ReactNode;
}

const variantStyles = {
  default: 'bg-neutral-100 border-neutral-200',
  primary: 'bg-gradient-to-br from-primary-600 to-primary-800 border-primary-700',
  subtle: 'bg-white border-neutral-200 shadow-sm',
};

const textStyles = {
  default: { title: 'text-neutral-900', desc: 'text-neutral-600' },
  primary: { title: 'text-white', desc: 'text-primary-100' },
  subtle: { title: 'text-neutral-900', desc: 'text-neutral-600' },
};

export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'default',
  children,
}: CTASectionProps) {
  const isPrimary = variant === 'primary';
  const styles = textStyles[variant];

  return (
    <FadeIn>
      <div className={`not-prose my-8 rounded-2xl border p-8 text-center md:p-12 ${variantStyles[variant]}`}>
        <h3 className={`font-display text-2xl font-bold ${styles.title}`}>{title}</h3>
        {description && (
          <p className={`mx-auto mt-3 max-w-2xl ${styles.desc}`}>{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {(primaryAction || secondaryAction) && (
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            {primaryAction && (
              primaryAction.external ? (
                <a
                  href={primaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                    isPrimary
                      ? 'bg-white text-primary-700 hover:bg-primary-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {primaryAction.label}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={primaryAction.href}
                  className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                    isPrimary
                      ? 'bg-white text-primary-700 hover:bg-primary-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )
            )}
            {secondaryAction && (
              secondaryAction.external ? (
                <a
                  href={secondaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium transition-colors ${
                    isPrimary
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {secondaryAction.label}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={secondaryAction.href}
                  className={`inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium transition-colors ${
                    isPrimary
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {secondaryAction.label}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
