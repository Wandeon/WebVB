'use client';

import { useEffect } from 'react';

const UMAMI_URL = 'https://analytics.velikibukovec.hr/script.js';
const WEBSITE_ID = '3a7c2aca-ce88-4240-9bc0-97d9cf18ccb2';
const COOKIE_CONSENT_KEY = 'vb-cookie-consent';

export function AnalyticsTracker() {
  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return;

    try {
      const prefs = JSON.parse(consent) as { analytics?: boolean };
      if (!prefs.analytics) return;
    } catch {
      return;
    }

    const script = document.createElement('script');
    script.src = UMAMI_URL;
    script.setAttribute('data-website-id', WEBSITE_ID);
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
