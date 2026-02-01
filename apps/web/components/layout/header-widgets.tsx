'use client';

import { CloudRain, CloudSun, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

// Compact Office Status
export function OfficeStatusBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentMinutes = hour * 60 + minute;

      const openTime = 7 * 60; // 7:00
      const closeTime = 15 * 60; // 15:00

      if (day >= 1 && day <= 5 && currentMinutes >= openTime && currentMinutes < closeTime) {
        setIsOpen(true);
        const closeHour = Math.floor(closeTime / 60);
        setStatusText(`do ${closeHour}:00`);
      } else {
        setIsOpen(false);
        if (day === 0 || day === 6) {
          setStatusText('pon 7:00');
        } else if (currentMinutes < openTime) {
          setStatusText('7:00');
        } else {
          setStatusText(day === 5 ? 'pon 7:00' : 'sutra 7:00');
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium md:flex">
      <span
        className={`h-2 w-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`}
      />
      <span className={isOpen ? 'text-emerald-700' : 'text-neutral-600'}>
        {isOpen ? 'Otvoreno' : 'Zatvoreno'}
      </span>
      <span className="text-neutral-400">•</span>
      <span className="text-neutral-500">{statusText}</span>
    </div>
  );
}

// Compact Weather Widget
export function WeatherBadge() {
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=46.35&longitude=16.75&current=temperature_2m,weather_code&timezone=Europe/Zagreb'
    )
      .then((res) => res.json())
      .then((data: { current?: { weather_code?: number; temperature_2m?: number } }) => {
        const weatherCode = data.current?.weather_code ?? 0;
        let condition = 'sunny';
        if (weatherCode >= 61 && weatherCode <= 67) condition = 'rainy';
        else if (weatherCode >= 1 && weatherCode <= 3) condition = 'cloudy';
        else if (weatherCode >= 45 && weatherCode <= 48) condition = 'cloudy';

        setWeather({
          temp: Math.round(data.current?.temperature_2m ?? 0),
          condition,
        });
      })
      .catch(() => {
        setWeather({ temp: 5, condition: 'cloudy' });
      });
  }, []);

  const WeatherIcon =
    weather?.condition === 'rainy' ? CloudRain : weather?.condition === 'cloudy' ? CloudSun : Sun;

  if (!weather) return null;

  return (
    <div className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 md:flex">
      <WeatherIcon className="h-3.5 w-3.5" />
      <span>{weather.temp}°C</span>
    </div>
  );
}

// Social Icons
export function SocialIcons() {
  return (
    <div className="hidden items-center gap-1 md:flex">
      <a
        href="https://www.facebook.com/profile.php?id=100064633498498"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
        aria-label="Facebook"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      </a>
      <a
        href="https://www.instagram.com/opcaborovik/"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-pink-50 hover:text-pink-600"
        aria-label="Instagram"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      </a>
    </div>
  );
}

// Language Switcher
export function LanguageSwitcher() {
  const [lang, setLang] = useState<'hr' | 'en'>('hr');

  // For now, this is just UI - actual translation would need i18n setup
  const toggleLang = () => {
    setLang(lang === 'hr' ? 'en' : 'hr');
    // In future: router.push with locale change
  };

  return (
    <button
      onClick={toggleLang}
      className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 md:flex"
      aria-label="Promijeni jezik"
    >
      <span className={lang === 'hr' ? 'font-bold text-primary-700' : ''}>HR</span>
      <span className="text-neutral-300">|</span>
      <span className={lang === 'en' ? 'font-bold text-primary-700' : ''}>EN</span>
    </button>
  );
}
