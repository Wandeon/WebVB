'use client';

import { cn } from '@repo/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { adminNavigation, type NavItem, type NavSection } from '@/config/navigation';

function NavItemComponent({ item, collapsed }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-900'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.title : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
      {!collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavSectionComponent({ section, collapsed }: { section: NavSection; collapsed?: boolean }) {
  return (
    <div className="space-y-1">
      {section.title && !collapsed && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {section.title}
        </h3>
      )}
      {section.items.map((item) => (
        <NavItemComponent key={item.href} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
}

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-neutral-200 bg-white',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b border-neutral-200', collapsed ? 'justify-center px-2' : 'px-6')}>
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            VB
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              VB
            </div>
            <span className="font-display text-lg font-semibold text-neutral-900">Admin</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {adminNavigation.map((section, index) => (
          <NavSectionComponent key={index} section={section} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
