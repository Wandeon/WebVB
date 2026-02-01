'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

import type { ExternalService } from '../lib/external-services';

interface ExternalServicesSectionProps {
  services: ExternalService[];
}

const categoryColors = {
  legal: 'border-blue-200 bg-blue-50',
  transparency: 'border-green-200 bg-green-50',
  participation: 'border-amber-200 bg-amber-50',
} as const;

const categoryBadgeColors = {
  legal: 'bg-blue-100 text-blue-700',
  transparency: 'bg-green-100 text-green-700',
  participation: 'bg-amber-100 text-amber-700',
} as const;

export function ExternalServicesSection({ services }: ExternalServicesSectionProps) {
  return (
    <section className="bg-gradient-to-b from-neutral-50 to-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
            Javni servisi i transparentnost
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
            Pristupite službenim portalima za uvid u proračun, registre i sudjelovanje u
            donošenju odluka
          </p>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service) => (
            <ExternalServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 sm:hidden">
          {services.map((service) => (
            <div key={service.id} className="w-[280px] flex-shrink-0">
              <ExternalServiceCard service={service} />
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <ExternalLink className="mr-1 inline-block h-3.5 w-3.5" />
          Ove poveznice vode na vanjske službene portale
        </p>
      </div>
    </section>
  );
}

function ExternalServiceCard({ service }: { service: ExternalService }) {
  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex h-full flex-col rounded-xl border p-4 transition-all hover:shadow-md ${categoryColors[service.category]}`}
    >
      {/* Logo Container */}
      <div className="flex h-16 items-center justify-center rounded-lg bg-white p-3">
        <Image
          src={service.logo}
          alt={`${service.name} logo`}
          width={120}
          height={40}
          className="max-h-10 w-auto object-contain"
        />
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col">
        <span
          className={`inline-block self-start rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeColors[service.category]}`}
        >
          {service.categoryLabel}
        </span>
        <h3 className="mt-2 font-display text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
          {service.name}
        </h3>
        <p className="mt-1 flex-1 text-xs text-neutral-600">{service.description}</p>
        <div className="mt-3 flex items-center text-xs font-medium text-primary-600 group-hover:text-primary-700">
          Otvori portal
          <ExternalLink className="ml-1 h-3 w-3" />
        </div>
      </div>
    </a>
  );
}
