'use client';

import { Button } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { NavGroup } from '../../lib/navigation';

interface MobileMenuProps {
  groups: NavGroup[];
  logo?: React.ReactNode;
}

const iconMap: Record<string, typeof Building2> = {
  building: Building2,
  newspaper: Newspaper,
  home: Home,
};

export function MobileMenu({ groups, logo }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    if (href.includes('?')) {
      return pathname === href.split('?')[0];
    }
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Otvori izbornik"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Full-Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'grid',
              gridTemplateRows: '64px 1fr auto',
              backgroundColor: '#ffffff',
              height: '100dvh',
              width: '100vw',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigacija"
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                borderBottom: '1px solid #e5e5e5',
                backgroundColor: '#ffffff',
              }}
            >
              {logo && <div>{logo}</div>}
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '8px',
                  borderRadius: '9999px',
                  color: '#737373',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Zatvori izbornik"
              >
                <X style={{ width: 24, height: 24 }} />
              </button>
            </div>

            {/* Navigation - scrollable */}
            <div
              style={{
                overflowY: 'auto',
                padding: '24px 16px',
                backgroundColor: '#ffffff',
                minHeight: 0,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {groups.map((group) => {
                  const Icon = iconMap[group.icon] || Building2;
                  return (
                    <div key={group.title}>
                      {/* Group Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            backgroundColor: '#dcfce7',
                          }}
                        >
                          <Icon style={{ width: 20, height: 20, color: '#16a34a' }} />
                        </div>
                        <h3
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#15803d',
                            margin: 0,
                          }}
                        >
                          {group.title}
                        </h3>
                      </div>

                      {/* Group Links */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {group.items.map((item) => (
                          <div key={item.href}>
                            {item.external ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  minHeight: '44px',
                                  padding: '12px 16px',
                                  borderRadius: '12px',
                                  backgroundColor: '#f5f5f5',
                                  color: '#404040',
                                  fontSize: '16px',
                                  fontWeight: 500,
                                  textDecoration: 'none',
                                }}
                              >
                                {item.title}
                                <ExternalLink style={{ width: 16, height: 16, color: '#a3a3a3' }} />
                              </a>
                            ) : (
                              <Link
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  minHeight: '44px',
                                  padding: '12px 16px',
                                  borderRadius: '12px',
                                  backgroundColor: isActive(item.href) ? '#dcfce7' : '#f5f5f5',
                                  color: isActive(item.href) ? '#15803d' : '#404040',
                                  fontSize: '16px',
                                  fontWeight: 500,
                                  textDecoration: 'none',
                                }}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                              >
                                {item.title}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: '1px solid #e5e5e5',
                backgroundColor: '#fafafa',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#525252',
                }}
              >
                <a
                  href="tel:042719033"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <Phone style={{ width: 16, height: 16 }} />
                  042/719-033
                </a>
                <a
                  href="mailto:opcina@velikibukovec.hr"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <Mail style={{ width: 16, height: 16 }} />
                  Email
                </a>
                <a
                  href="https://maps.google.com/?q=Trg+S.+Radića+28+Veliki+Bukovec"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <MapPin style={{ width: 16, height: 16 }} />
                  Lokacija
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
