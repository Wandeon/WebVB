'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Pre-generated random values for cookie crumb animations to satisfy React's purity requirements
const CRUMB_ANIMATIONS = [
  { initialX: 15, initialScale: 0.75, animateX: 85, duration: 3.5 },
  { initialX: 42, initialScale: 0.6, animateX: 28, duration: 4.2 },
  { initialX: 78, initialScale: 0.9, animateX: 62, duration: 3.8 },
  { initialX: 25, initialScale: 0.55, animateX: 95, duration: 4.5 },
  { initialX: 55, initialScale: 0.8, animateX: 12, duration: 3.2 },
  { initialX: 90, initialScale: 0.65, animateX: 45, duration: 4.0 },
];

const COOKIE_CONSENT_KEY = 'vb-cookie-consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay appearance for dramatic effect
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setIsExiting(true);
    setTimeout(() => setIsVisible(false), 600);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none sm:items-end sm:justify-end">
          {/* Backdrop for settings modal */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm pointer-events-auto"
                onClick={() => setShowSettings(false)}
              />
            )}
          </AnimatePresence>

          {/* Main cookie card */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: 45 }}
            animate={isExiting
              ? { opacity: 0, y: -50, scale: 0.5, rotateX: -20 }
              : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
            }
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
              duration: isExiting ? 0.5 : 0.8
            }}
            className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl"
            style={{ perspective: '1000px' }}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl p-[2px] overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-50%]"
                style={{
                  background: 'conic-gradient(from 0deg, #10b981, #34d399, #6ee7b7, #a7f3d0, #34d399, #10b981)'
                }}
              />
            </div>

            {/* Glass content */}
            <div className="relative m-[2px] rounded-[22px] bg-white/95 backdrop-blur-xl">
              {/* Floating cookie crumbs */}
              <div className="absolute inset-0 overflow-hidden rounded-[22px] pointer-events-none">
                {CRUMB_ANIMATIONS.map((anim, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-emerald-400/60"
                    initial={{
                      x: anim.initialX + '%',
                      y: '100%',
                      scale: anim.initialScale
                    }}
                    animate={{
                      y: [null, '-20%'],
                      x: [null, `${anim.animateX}%`],
                      opacity: [0.6, 0],
                      scale: [null, 0]
                    }}
                    transition={{
                      duration: anim.duration,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>

              {/* Header with animated cookie */}
              <div className="flex items-start gap-4 p-6 pb-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-lg"
                >
                  <Cookie className="h-7 w-7 text-emerald-600" />
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold text-neutral-900"
                  >
                    Kolačići i privatnost
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-1 text-sm text-neutral-600"
                  >
                    Koristimo kolačiće za poboljšanje vašeg iskustva na stranici.
                  </motion.p>
                </div>
              </div>

              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-neutral-100 px-6 py-4 space-y-3">
                      {/* Necessary */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-neutral-800">Neophodni</span>
                        </div>
                        <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Uvijek aktivni
                        </div>
                      </div>

                      {/* Analytics */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm font-medium text-neutral-800">Analitički</span>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            preferences.analytics ? 'bg-primary-600' : 'bg-neutral-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: preferences.analytics ? 20 : 2 }}
                            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </label>

                      {/* Marketing */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm font-medium text-neutral-800">Marketinški</span>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            preferences.marketing ? 'bg-primary-600' : 'bg-neutral-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: preferences.marketing ? 20 : 2 }}
                            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="p-6 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={acceptAll}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-shadow hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    Prihvaćam sve
                  </motion.button>
                  {showSettings ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={acceptSelected}
                      className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Spremi odabir
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSettings(true)}
                      className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Postavke
                    </motion.button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                  <button
                    onClick={rejectAll}
                    className="hover:text-neutral-700 hover:underline"
                  >
                    Samo neophodni
                  </button>
                  <Link
                    href="/privatnost"
                    className="hover:text-neutral-700 hover:underline"
                  >
                    Politika privatnosti
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
