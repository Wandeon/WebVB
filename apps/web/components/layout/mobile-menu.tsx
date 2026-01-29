'use client';

import { Button } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Accessibility,
  Building2,
  Check,
  ExternalLink,
  Globe,
  Home,
  Mail,
  MapPin,
  Menu,
  Moon,
  Newspaper,
  Phone,
  Type,
  X,
  Zap,
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

const ACCESSIBILITY_KEY = 'vb-accessibility';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reduceMotion: false,
};

export function MobileMenu({ groups, logo }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(defaultSettings);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Load accessibility settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(ACCESSIBILITY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccessibilitySettings(parsed);
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  // Apply accessibility settings
  const applySettings = (s: AccessibilitySettings) => {
    const root = document.documentElement;

    if (s.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (s.fontSize === 'xlarge') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '';
    }

    if (s.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (s.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  const updateAccessibility = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...accessibilitySettings, ...newSettings };
    setAccessibilitySettings(updated);
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(updated));
    applySettings(updated);
  };

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
    setShowAccessibility(false);
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
      if (showAccessibility) {
        setShowAccessibility(false);
      } else {
        setIsOpen(false);
      }
    }
  }, [showAccessibility]);

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

  const hasActiveAccessibility =
    accessibilitySettings.fontSize !== 'normal' ||
    accessibilitySettings.highContrast ||
    accessibilitySettings.reduceMotion;

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
              display: 'flex',
              flexDirection: 'column',
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
                height: '64px',
                flexShrink: 0,
                borderBottom: '1px solid #e5e5e5',
                backgroundColor: '#ffffff',
              }}
            >
              {logo && <div>{logo}</div>}
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  color: '#525252',
                  background: '#f5f5f5',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Zatvori izbornik"
              >
                <X style={{ width: 24, height: 24 }} />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderBottom: '1px solid #e5e5e5',
                backgroundColor: '#fafafa',
                flexShrink: 0,
              }}
            >
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=100064633498498"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#1877f2',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
                aria-label="Facebook"
              >
                <svg style={{ width: 18, height: 18 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/opcaborovik/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
                aria-label="Instagram"
              >
                <svg style={{ width: 18, height: 18 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>

              {/* Language */}
              <button
                onClick={() => {/* Future i18n */}}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  background: '#e5e5e5',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
                aria-label="Promijeni jezik"
              >
                <Globe style={{ width: 16, height: 16, color: '#525252' }} />
                <span style={{ color: '#16a34a', fontWeight: 700 }}>HR</span>
                <span style={{ color: '#a3a3a3' }}>|</span>
                <span style={{ color: '#737373' }}>EN</span>
              </button>

              {/* Accessibility */}
              <button
                onClick={() => setShowAccessibility(!showAccessibility)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: hasActiveAccessibility ? '#16a34a' : '#e5e5e5',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: hasActiveAccessibility ? '#ffffff' : '#525252',
                }}
                aria-label="Pristupačnost"
                aria-expanded={showAccessibility}
              >
                <Accessibility style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Accessibility Panel */}
            <AnimatePresence>
              {showAccessibility && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', flexShrink: 0 }}
                >
                  <div
                    style={{
                      padding: '20px 16px',
                      backgroundColor: '#f0fdf4',
                      borderBottom: '1px solid #bbf7d0',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#166534',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Accessibility style={{ width: 18, height: 18 }} />
                      Postavke pristupačnosti
                    </h3>

                    {/* Font Size */}
                    <div style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#525252',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Type style={{ width: 14, height: 14 }} />
                        Veličina teksta
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(['normal', 'large', 'xlarge'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => updateAccessibility({ fontSize: size })}
                            style={{
                              flex: 1,
                              padding: '12px',
                              borderRadius: '10px',
                              border: accessibilitySettings.fontSize === size ? '2px solid #16a34a' : '2px solid #e5e5e5',
                              background: accessibilitySettings.fontSize === size ? '#dcfce7' : '#ffffff',
                              cursor: 'pointer',
                              fontSize: size === 'normal' ? '14px' : size === 'large' ? '16px' : '18px',
                              fontWeight: 600,
                              color: accessibilitySettings.fontSize === size ? '#166534' : '#525252',
                            }}
                          >
                            Aa
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* High Contrast */}
                      <button
                        onClick={() => updateAccessibility({ highContrast: !accessibilitySettings.highContrast })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '2px solid #e5e5e5',
                          background: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 500, color: '#404040' }}>
                          <Moon style={{ width: 18, height: 18 }} />
                          Visoki kontrast
                        </span>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: accessibilitySettings.highContrast ? '#16a34a' : '#e5e5e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {accessibilitySettings.highContrast && <Check style={{ width: 16, height: 16, color: '#ffffff' }} />}
                        </div>
                      </button>

                      {/* Reduce Motion */}
                      <button
                        onClick={() => updateAccessibility({ reduceMotion: !accessibilitySettings.reduceMotion })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '2px solid #e5e5e5',
                          background: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 500, color: '#404040' }}>
                          <Zap style={{ width: 18, height: 18 }} />
                          Bez animacija
                        </span>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: accessibilitySettings.reduceMotion ? '#16a34a' : '#e5e5e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {accessibilitySettings.reduceMotion && <Check style={{ width: 16, height: 16, color: '#ffffff' }} />}
                        </div>
                      </button>
                    </div>

                    {/* Reset */}
                    {hasActiveAccessibility && (
                      <button
                        onClick={() => updateAccessibility(defaultSettings)}
                        style={{
                          marginTop: '12px',
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Vrati na zadano
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation - scrollable */}
            <div
              style={{
                flex: 1,
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
                                  minHeight: '48px',
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
                                  minHeight: '48px',
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
                flexShrink: 0,
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
