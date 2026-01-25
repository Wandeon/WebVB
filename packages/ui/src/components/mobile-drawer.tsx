'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../primitives/sheet';

import type { NavItem } from './nav-menu';

interface MobileDrawerProps {
    items: NavItem[];
    logo?: React.ReactNode;
}

export function MobileDrawer({ items, logo }: MobileDrawerProps) {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(href + '/');
    }

    function isParentActive(item: NavItem): boolean {
        if (isActive(item.href)) return true;
        if (item.items) {
            return item.items.some((sub) => isActive(sub.href));
        }
        return false;
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Izbornik</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="border-b p-6 text-left">
                    {logo && <div className="mb-4">{logo}</div>}
                    <SheetTitle className="text-xl font-bold text-primary-700">Izbornik</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-4">
                    {items.map((item) => (
                        <div key={item.title} className="border-b border-neutral-100 last:border-0">
                            {item.items ? (
                                <div className="px-6 py-4">
                                    <div className={cn(
                                        "font-semibold mb-2",
                                        isParentActive(item) ? "text-primary-600" : "text-neutral-900"
                                    )}>
                                        {item.title}
                                    </div>
                                    <div className="flex flex-col space-y-3 pl-2 border-l-2 border-primary-100 ml-1">
                                        {item.items.map(subItem => (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                onClick={() => setOpen(false)}
                                                aria-current={isActive(subItem.href) ? "page" : undefined}
                                                className={cn(
                                                    "text-sm font-medium hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 rounded-sm",
                                                    isActive(subItem.href)
                                                        ? "text-primary-600 font-semibold"
                                                        : "text-neutral-600"
                                                )}
                                            >
                                                {subItem.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    aria-current={isActive(item.href) ? "page" : undefined}
                                    className={cn(
                                        "block px-6 py-4 font-semibold hover:bg-neutral-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 rounded-sm",
                                        isActive(item.href)
                                            ? "text-primary-600 bg-primary-50"
                                            : "text-neutral-900"
                                    )}
                                >
                                    {item.title}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
