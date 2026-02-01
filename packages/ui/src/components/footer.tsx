'use client';

import Link from 'next/link';
import * as React from 'react';

import { cn } from '../lib/utils';
import { Separator } from '../primitives/separator';

export interface FooterLinkGroup {
    title: string;
    items: { title: string; href: string }[];
}

interface FooterProps {
    groups: FooterLinkGroup[];
    logo?: React.ReactNode;
    copyright: string;
    className?: string;
    socialLinks?: React.ReactNode;
}

export function Footer({ groups, logo, copyright, className, socialLinks }: FooterProps) {
    const isExternalLink = (href: string) => href.startsWith('http://') || href.startsWith('https://');
    const isMailLink = (href: string) => href.startsWith('mailto:') || href.startsWith('tel:');

    return (
        <footer className={cn('bg-neutral-900 text-neutral-50', className)}>
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-4">
                    {/* Logo section */}
                    <div className="space-y-4">
                        {logo}
                        <div className="text-sm text-neutral-400">
                            Službena web stranica Općine Veliki Bukovec.
                        </div>
                        {socialLinks}
                    </div>

                    {/* Link groups - 2 columns on mobile, spread on desktop */}
                    <div className="col-span-1 grid grid-cols-2 gap-6 md:gap-8 lg:col-span-3 lg:grid-cols-3">
                        {groups.map((group) => (
                            <div key={group.title} className="space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 md:text-sm">
                                    {group.title}
                                </h3>
                                <ul className="space-y-1.5 md:space-y-2">
                                    {group.items.map((item) => (
                                        <li key={item.title}>
                                            {isExternalLink(item.href) || isMailLink(item.href) ? (
                                                <a
                                                    href={item.href}
                                                    className="text-xs text-neutral-300 transition-colors hover:text-white md:text-sm"
                                                    {...(isExternalLink(item.href)
                                                        ? { target: '_blank', rel: 'noopener noreferrer' }
                                                        : {})}
                                                >
                                                    {item.title}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className="text-xs text-neutral-300 transition-colors hover:text-white md:text-sm"
                                                >
                                                    {item.title}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="my-8 bg-neutral-800" />

                <div className="flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 md:flex-row">
                    <p>{copyright}</p>
                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-neutral-400 md:justify-end">
                        <Link href="/privatnost" className="hover:text-neutral-300" title="GDPR načela primijenjena">
                            Privatnost
                        </Link>
                        <span className="hidden text-neutral-600 md:inline">·</span>
                        <Link href="/izjava-o-pristupacnosti" className="hover:text-neutral-300" title="WCAG načela primijenjena">
                            Pristupačnost
                        </Link>
                        <span className="hidden text-neutral-600 md:inline">·</span>
                        <Link href="/sigurnost" className="hover:text-neutral-300" title="NIS2 načela primijenjena">
                            Sigurnost
                        </Link>
                        <span className="hidden text-neutral-600 md:inline">·</span>
                        <Link href="/transparentnost" className="hover:text-neutral-300" title="Javne informacije">
                            Transparentnost
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
