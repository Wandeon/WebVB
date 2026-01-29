'use client';

import { FadeIn } from '@repo/ui';
import { AlertCircle, Clock, Info, MapPin, Phone } from 'lucide-react';

import type { ReactNode } from 'react';

const variants = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    title: 'text-blue-900',
  },
  contact: {
    icon: Phone,
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    iconColor: 'text-primary-600',
    title: 'text-primary-900',
  },
  location: {
    icon: MapPin,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    title: 'text-amber-900',
  },
  hours: {
    icon: Clock,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    title: 'text-green-900',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconColor: 'text-orange-600',
    title: 'text-orange-900',
  },
};

export type InfoBoxVariant = keyof typeof variants;

export interface InfoBoxProps {
  title?: string;
  variant?: InfoBoxVariant;
  children: ReactNode;
}

export function InfoBox({ title, variant = 'info', children }: InfoBoxProps) {
  const styles = variants[variant];
  const Icon = styles.icon;

  return (
    <FadeIn>
      <div
        className={`my-6 rounded-xl border ${styles.border} ${styles.bg} p-6`}
      >
        <div className="flex gap-4">
          <div className={`flex-shrink-0 ${styles.iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            {title && (
              <h4 className={`mb-2 font-display font-semibold ${styles.title}`}>
                {title}
              </h4>
            )}
            <div className="prose prose-sm max-w-none text-neutral-700 prose-p:my-1 prose-a:text-primary-600">
              {children}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
