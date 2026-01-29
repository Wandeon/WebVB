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
                                            <Link
                                                href={item.href}
                                                className="text-xs text-neutral-300 transition-colors hover:text-white md:text-sm"
                                            >
                                                {item.title}
                                            </Link>
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
                    <div className="flex gap-4">
                        <Link href="/izjava-o-pristupacnosti" className="hover:text-neutral-300">Izjava o pristupačnosti</Link>
                        <Link href="/privatnost" className="hover:text-neutral-300">Politika privatnosti</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
