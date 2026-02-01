'use client';

import { Bell, BellOff, Download, Settings, Share, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { NotificationSettings } from './notification-settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const INSTALL_PROMPT_COOLDOWN_DAYS = 30;
const INSTALL_PROMPT_STORAGE_KEY = 'vb-install-prompt-dismissed';
const IOS_INSTALL_STORAGE_KEY = 'vb-ios-install-dismissed';
const NOTIFICATION_STORAGE_KEY = 'vb-notifications-enabled';

// Detect iOS Safari
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Detect if running as installed PWA (standalone mode)
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface VapidKeyResponse {
  success: boolean;
  data?: { publicKey: string };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface SubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function PwaRegister() {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionKeys, setSubscriptionKeys] = useState<SubscriptionKeys | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        setSwRegistration(registration);

        // Check existing subscription
        void registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(subscription !== null);
          if (subscription) {
            const json = subscription.toJSON();
            setSubscriptionKeys({
              endpoint: subscription.endpoint,
              p256dh: json.keys?.p256dh || '',
              auth: json.keys?.auth || '',
            });
          }
        });
      })
      .catch((err) => {
        void err;
      });

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Listen for install prompt (Android/Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed recently
      const dismissedAt = localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY);
      if (dismissedAt) {
        const dismissedDate = new Date(dismissedAt);
        const cooldownEnd = new Date(dismissedDate.getTime() + INSTALL_PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
        if (new Date() < cooldownEnd) {
          return;
        }
      }

      // Show install prompt after a delay
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // iOS-specific install prompt (Safari doesn't fire beforeinstallprompt)
  useEffect(() => {
    if (!isIOS() || isStandalone()) return;

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(IOS_INSTALL_STORAGE_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const cooldownEnd = new Date(dismissedDate.getTime() + INSTALL_PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        return;
      }
    }

    // Show iOS install helper after a delay
    const timer = setTimeout(() => setShowIOSInstallPrompt(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show notification prompt if not subscribed and permission not denied
  // On iOS, only show if app is installed (standalone mode)
  useEffect(() => {
    const shouldShowNotificationPrompt =
      swRegistration &&
      !isSubscribed &&
      notificationPermission !== 'denied' &&
      !localStorage.getItem(NOTIFICATION_STORAGE_KEY) &&
      // On iOS, only prompt for notifications when running as installed PWA
      (!isIOS() || isStandalone());

    if (shouldShowNotificationPrompt) {
      // Show after a delay
      const timer = setTimeout(() => setShowNotificationPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [swRegistration, isSubscribed, notificationPermission]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'dismissed') {
        localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, new Date().toISOString());
      }
    } catch (err) {
      void err;
    } finally {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  }, [deferredPrompt]);

  const handleDismissInstall = useCallback(() => {
    localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, new Date().toISOString());
    setShowInstallPrompt(false);
  }, []);

  const handleDismissIOSInstall = useCallback(() => {
    localStorage.setItem(IOS_INSTALL_STORAGE_KEY, new Date().toISOString());
    setShowIOSInstallPrompt(false);
  }, []);

  const handleEnableNotifications = useCallback(async () => {
    if (!swRegistration || isLoading) return;

    setIsLoading(true);

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        setShowNotificationPrompt(false);
        return;
      }

      // Get VAPID public key from admin API
      const keyResponse = await fetch(`${API_URL}/api/push/vapid-public-key`);
      const keyData = (await keyResponse.json()) as VapidKeyResponse;

      if (!keyData.success || !keyData.data?.publicKey) {
        throw new Error('Failed to get VAPID public key');
      }

      // Subscribe to push
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.data.publicKey) as BufferSource,
      });

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      const response = await fetch(`${API_URL}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          p256dh: subscriptionJson.keys?.p256dh,
          auth: subscriptionJson.keys?.auth,
          userAgent: navigator.userAgent,
          topics: ['all'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register subscription');
      }

      setIsSubscribed(true);
      setSubscriptionKeys({
        endpoint: subscriptionJson.endpoint || '',
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
      });
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
      setShowNotificationPrompt(false);
    } catch (err) {
      void err;
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration, isLoading]);

  const handleDismissNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'dismissed');
    setShowNotificationPrompt(false);
  }, []);

  const handleUnsubscribe = useCallback(async () => {
    if (!swRegistration || !subscriptionKeys) return;

    try {
      // Unsubscribe from push manager
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Notify server
      await fetch(`${API_URL}/api/push/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscriptionKeys.endpoint }),
      });

      setIsSubscribed(false);
      setSubscriptionKeys(null);
      localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    } catch (err) {
      void err;
    }
  }, [swRegistration, subscriptionKeys]);

  // Don't render anything on server
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <>
      {/* Settings Button - Fixed position when subscribed */}
      {isSubscribed && subscriptionKeys && (
        <button
          onClick={() => setShowSettingsModal(true)}
          className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-neutral-200 transition-transform hover:scale-105 sm:bottom-4"
          aria-label="Postavke obavijesti"
        >
          <Settings className="h-5 w-5 text-neutral-600" />
        </button>
      )}

      {/* Notification Settings Modal */}
      <NotificationSettings
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        subscriptionKeys={subscriptionKeys}
        onUnsubscribe={() => void handleUnsubscribe()}
      />

      {/* iOS Install Helper */}
      {showIOSInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 sm:bottom-4 sm:left-auto sm:right-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xl">
            <button
              onClick={handleDismissIOSInstall}
              className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Zatvori"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                <Download className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">Instaliraj aplikaciju</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Za instalaciju na iPhone/iPad:
                </p>
                <ol className="mt-2 space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">1</span>
                    <span>Pritisnite <Share className="inline h-4 w-4 text-primary-600" /> na dnu ekrana</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">2</span>
                    <span>Odaberite &quot;Dodaj na početni zaslon&quot;</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">3</span>
                    <span>Pritisnite &quot;Dodaj&quot;</span>
                  </li>
                </ol>
                <p className="mt-3 text-xs text-neutral-500">
                  Nakon instalacije moći ćete primati obavijesti.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt (Android/Chrome) */}
      {showInstallPrompt && deferredPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 sm:bottom-4 sm:left-auto sm:right-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xl">
            <button
              onClick={handleDismissInstall}
              className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Zatvori"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                <Download className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">Instaliraj aplikaciju</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Dodaj Općinu Veliki Bukovec na početni zaslon za brži pristup.
                </p>
                <button
                  onClick={() => void handleInstall()}
                  className="mt-3 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Instaliraj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Prompt */}
      {showNotificationPrompt && !showInstallPrompt && !showIOSInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 sm:bottom-4 sm:left-auto sm:right-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xl">
            <button
              onClick={handleDismissNotifications}
              className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Zatvori"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                {notificationPermission === 'denied' ? (
                  <BellOff className="h-5 w-5 text-neutral-400" />
                ) : (
                  <Bell className="h-5 w-5 text-primary-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">Primaj obavijesti</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Budi u toku s odvozom otpada, novostima i obavijestima.
                </p>
                {notificationPermission === 'denied' ? (
                  <p className="mt-2 text-xs text-amber-600">
                    Obavijesti su blokirane u postavkama preglednika.
                  </p>
                ) : (
                  <button
                    onClick={() => void handleEnableNotifications()}
                    disabled={isLoading}
                    className="mt-3 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Učitavanje...' : 'Omogući obavijesti'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
