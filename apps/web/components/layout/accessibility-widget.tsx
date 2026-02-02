'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Check, Moon, Type, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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

// Apply settings to document - defined outside component to avoid hook ordering issues
const applySettingsToDocument = (s: AccessibilitySettings) => {
  const root = document.documentElement;

  // Font size
  root.classList.remove('text-base', 'text-lg', 'text-xl');
  if (s.fontSize === 'large') {
    root.style.fontSize = '18px';
  } else if (s.fontSize === 'xlarge') {
    root.style.fontSize = '20px';
  } else {
    root.style.fontSize = '';
  }

  // High contrast
  if (s.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Reduce motion
  if (s.reduceMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
};

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(ACCESSIBILITY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AccessibilitySettings;
        setTimeout(() => {
          setSettings(parsed);
          applySettingsToDocument(parsed);
        }, 0);
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  // Save and apply settings
  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(updated));
      applySettingsToDocument(updated);
      return updated;
    });
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const hasActiveSettings =
    settings.fontSize !== 'normal' || settings.highContrast || settings.reduceMotion;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full p-2.5 transition-colors ${
          hasActiveSettings
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
        }`}
        aria-label="Postavke pristupačnosti"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Pristupačnost"
      >
        <Accessibility className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl"
            role="menu"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Accessibility className="h-4 w-4 text-primary-600" />
              Pristupačnost
            </h3>

            {/* Font Size */}
            <div className="mb-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-600">
                <Type className="h-3.5 w-3.5" />
                Veličina teksta
              </label>
              <div className="flex gap-2">
                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-center transition-all ${
                      settings.fontSize === size
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span
                      className={
                        size === 'normal'
                          ? 'text-sm'
                          : size === 'large'
                            ? 'text-base'
                            : 'text-lg'
                      }
                    >
                      Aa
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <button
              onClick={() => updateSettings({ highContrast: !settings.highContrast })}
              className="mb-2 flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 transition-colors hover:bg-neutral-50"
              role="menuitemcheckbox"
              aria-checked={settings.highContrast}
            >
              <span className="flex items-center gap-2 text-sm text-neutral-700">
                <Moon className="h-4 w-4" />
                Visoki kontrast
              </span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                  settings.highContrast
                    ? 'bg-primary-600 text-white'
                    : 'border border-neutral-300'
                }`}
              >
                {settings.highContrast && <Check className="h-3 w-3" />}
              </div>
            </button>

            {/* Reduce Motion */}
            <button
              onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
              className="mb-4 flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 transition-colors hover:bg-neutral-50"
              role="menuitemcheckbox"
              aria-checked={settings.reduceMotion}
            >
              <span className="flex items-center gap-2 text-sm text-neutral-700">
                <Zap className="h-4 w-4" />
                Bez animacija
              </span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                  settings.reduceMotion
                    ? 'bg-primary-600 text-white'
                    : 'border border-neutral-300'
                }`}
              >
                {settings.reduceMotion && <Check className="h-3 w-3" />}
              </div>
            </button>

            {/* Reset button */}
            {hasActiveSettings && (
              <button
                onClick={() => updateSettings(defaultSettings)}
                className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                Vrati na zadano
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
