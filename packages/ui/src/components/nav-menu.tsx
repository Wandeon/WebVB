'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../primitives/dropdown-menu';

export interface NavItem {
    title: string;
    href: string;
    items?: { title: string; href: string }[];
}

interface NavMenuProps {
    items: NavItem[];
    className?: string;
}

export function NavMenu({ items, className }: NavMenuProps) {
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(href + '/');
    }

    return (
        <nav aria-label="Glavna navigacija" className={cn('flex items-center gap-6', className)}>
            {items.map((item) => {
                if (item.items && item.items.length > 0) {
                    const activeParent = isActive(item.href);
                    return (
                        <DropdownMenu key={item.title}>
                            <DropdownMenuTrigger className={cn(
                                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-sm",
                                activeParent ? "text-primary-600 font-semibold" : "text-neutral-700"
                            )}
                            aria-current={activeParent ? "page" : undefined}>
                                {item.title}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                {item.items.map((subItem) => {
                                    const activeSubItem = isActive(subItem.href);
                                    return (
                                        <DropdownMenuItem key={subItem.href} asChild>
                                            <Link
                                                href={subItem.href}
                                                aria-current={activeSubItem ? "page" : undefined}
                                                className={cn(
                                                    "w-full cursor-pointer font-medium transition-colors focus:bg-primary-50 focus:text-primary-600",
                                                    activeSubItem
                                                        ? "text-primary-600 font-semibold"
                                                        : "text-neutral-600 hover:text-primary-600"
                                                )}
                                            >
                                                {subItem.title}
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                }

                const activeItem = isActive(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={activeItem ? "page" : undefined}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-sm",
                            activeItem ? "text-primary-600 font-semibold" : "text-neutral-700"
                        )}
                    >
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
