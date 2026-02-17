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
      .then((res) => res.json() as Promise<{ current?: { weather_code?: number; temperature_2m?: number } }>)
      .then((data) => {
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
      {/* Viber */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-purple-50 hover:text-purple-600"
        aria-label="Pridružite se Viber grupi"
        title="Viber grupa (uskoro)"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.4 0C9.473.028 5.34.396 3.18 2.394.727 4.663.153 8.076.015 12.286c-.138 4.21-.313 12.102 7.478 14.094h.006l-.005 3.22s-.05.78.486 1.167c.647.467 1.03.383 3.348-2.125 2.319-2.508 4.487-5.478 4.487-5.478s4.78.397 6.632-.536c1.85-.933 3.224-3.085 3.497-7.376.283-4.44-.534-9.198-3.504-11.78C19.873.712 15.403.046 11.4 0zm.504 2.2c3.467.04 7.333.63 9.4 2.6 2.424 2.108 3.094 6.287 2.856 10.086-.228 3.59-1.238 5.225-2.584 5.904-1.345.68-5.253.32-5.253.32l-3.08 3.56c-.445.513-.827.43-.827-.22V21c-6.22-1.32-5.99-7.227-5.882-10.567.107-3.34.434-6.19 2.5-8.08 1.33-1.216 3.967-1.95 6.088-2.07-.406-.008-.818-.005-1.218.016zm-.42 3.58c-.16 0-.32.068-.458.21-.32.332-.768.87-.924 1.144-.312.548-.22 1.204.072 1.808.585 1.212 1.346 2.24 2.374 3.27a13.706 13.706 0 003.242 2.48c.602.326 1.31.448 1.848.158.268-.145.816-.584 1.158-.91.342-.325.192-.768-.168-.96-.36-.192-1.67-.908-2.028-1.06-.36-.15-.652-.024-.892.25-.24.274-.706.826-.866.998-.16.172-.42.2-.66.078a8.67 8.67 0 01-2.076-1.292 8.014 8.014 0 01-1.496-1.822c-.138-.24-.012-.446.116-.59.116-.128.276-.336.414-.504.138-.168.24-.288.312-.468.07-.18-.018-.372-.096-.516-.078-.144-.658-1.62-.924-2.234-.132-.306-.378-.37-.578-.38a4.167 4.167 0 00-.368-.02zm3.186 1.004c.186 0 .338.15.348.34.02.384.058 1.038.468 1.7.41.66 1.103.97 1.478 1.012.188.022.356-.13.36-.318.007-.188-.146-.348-.334-.37-.254-.028-.718-.25-.998-.702-.28-.452-.32-.918-.338-1.232a.35.35 0 00-.37-.33.35.35 0 00-.614-.1zm-1.07-.44a.35.35 0 00-.326.37c.04.75.3 1.946 1.08 2.84.78.896 1.946 1.346 2.686 1.498.188.04.37-.082.41-.27a.353.353 0 00-.27-.41c-.61-.126-1.565-.49-2.19-1.208-.625-.72-.854-1.72-.89-2.4a.35.35 0 00-.37-.326zm-1.2-.56a.35.35 0 00-.336.36c.048 1.24.516 2.996 1.62 4.16 1.102 1.164 2.83 1.75 4.066 1.88a.35.35 0 00.376-.32.35.35 0 00-.32-.376c-1.09-.116-2.598-.62-3.534-1.608-.935-.987-1.37-2.544-1.412-3.66a.35.35 0 00-.36-.336z" />
        </svg>
      </a>
      {/* WhatsApp */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-green-50 hover:text-green-600"
        aria-label="Pridružite se WhatsApp grupi"
        title="WhatsApp grupa (uskoro)"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
