'use client';

import { CloudRain, CloudSun, ExternalLink, MessageCircle, Phone, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

function LiveClock() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-sky-900">{time || '--:--'}</div>
      <div className="text-sm text-sky-700 capitalize">{date || 'Učitavanje...'}</div>
    </div>
  );
}

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy';

function weatherCodeToCondition(code: number): WeatherCondition {
  if (code >= 61 && code <= 67) return 'rainy';
  if ((code >= 1 && code <= 3) || (code >= 45 && code <= 48)) return 'cloudy';
  return 'sunny';
}

function conditionIcon(condition: WeatherCondition) {
  if (condition === 'rainy') return CloudRain;
  if (condition === 'cloudy') return CloudSun;
  return Sun;
}

interface WeatherData {
  temp: number;
  condition: WeatherCondition;
  todayHigh: number | null;
  todayLow: number | null;
  tomorrowCondition: WeatherCondition | null;
  tomorrowHigh: number | null;
  tomorrowLow: number | null;
}

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=46.35&longitude=16.75&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=2&timezone=Europe/Zagreb')
      .then(res => res.json() as Promise<{
        current?: { weather_code?: number; temperature_2m?: number };
        daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[]; weather_code?: number[] };
      }>)
      .then(data => {
        const dailyMax = data.daily?.temperature_2m_max;
        const dailyMin = data.daily?.temperature_2m_min;
        const dailyCodes = data.daily?.weather_code;

        setWeather({
          temp: Math.round(data.current?.temperature_2m ?? 0),
          condition: weatherCodeToCondition(data.current?.weather_code ?? 0),
          todayHigh: dailyMax?.[0] != null ? Math.round(dailyMax[0]) : null,
          todayLow: dailyMin?.[0] != null ? Math.round(dailyMin[0]) : null,
          tomorrowCondition: dailyCodes?.[1] != null ? weatherCodeToCondition(dailyCodes[1]) : null,
          tomorrowHigh: dailyMax?.[1] != null ? Math.round(dailyMax[1]) : null,
          tomorrowLow: dailyMin?.[1] != null ? Math.round(dailyMin[1]) : null,
        });
      })
      .catch(() => {
        setWeather({ temp: 5, condition: 'cloudy', todayHigh: null, todayLow: null, tomorrowCondition: null, tomorrowHigh: null, tomorrowLow: null });
      });
  }, []);

  const WeatherIcon = weather ? conditionIcon(weather.condition) : Sun;
  const TomorrowIcon = weather?.tomorrowCondition ? conditionIcon(weather.tomorrowCondition) : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <WeatherIcon className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-900">{weather?.temp ?? '--'}°C</div>
          {weather?.todayHigh != null && weather?.todayLow != null && (
            <div className="text-xs text-sky-600">
              ↑ {weather.todayHigh}° ↓ {weather.todayLow}°
            </div>
          )}
        </div>
      </div>
      {TomorrowIcon && weather?.tomorrowHigh != null && (
        <div className="flex items-center gap-1.5 text-xs text-sky-600">
          <span>Sutra:</span>
          <TomorrowIcon className="h-3.5 w-3.5" />
          <span>↑ {weather.tomorrowHigh}° ↓ {weather.tomorrowLow}°</span>
        </div>
      )}
      <a
        href="https://meteo.hr/prognoze.php?section=prognoze&param=n_maprog"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700"
      >
        Detaljna prognoza
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function OfficeStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentMinutes = hour * 60 + minute;

      // Office hours: Mon-Fri, 7:00-15:00
      const openTime = 7 * 60; // 7:00
      const closeTime = 15 * 60; // 15:00

      if (day >= 1 && day <= 5 && currentMinutes >= openTime && currentMinutes < closeTime) {
        setIsOpen(true);
        const remainingMinutes = closeTime - currentMinutes;
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        setStatusText(`Zatvara za ${hours}h ${mins}min`);
      } else {
        setIsOpen(false);
        // Calculate when it opens next
        if (day === 0) {
          setStatusText('Otvara u ponedjeljak u 7:00');
        } else if (day === 6) {
          setStatusText('Otvara u ponedjeljak u 7:00');
        } else if (currentMinutes < openTime) {
          setStatusText('Otvara danas u 7:00');
        } else {
          setStatusText(day === 5 ? 'Otvara u ponedjeljak u 7:00' : 'Otvara sutra u 7:00');
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-sky-900">Upravni odjel</div>
        <div className="text-xs text-sky-600">{statusText || 'Provjeravam...'}</div>
      </div>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isOpen
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700'
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {isOpen ? 'Otvoreno' : 'Zatvoreno'}
      </span>
    </div>
  );
}

export function SmartDashboard() {
  return (
    <div className="relative h-full min-h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-sky-100 to-blue-100">
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="absolute right-10 top-1/3 h-32 w-32 rounded-full bg-amber-200/30 blur-2xl" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6">


        {/* Time & Weather Row */}
        <div className="mb-6 rounded-2xl bg-white/60 p-5 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <LiveClock />
            <div className="h-12 w-px bg-sky-200" />
            <WeatherWidget />
          </div>
        </div>

        {/* Office Status */}
        <div className="mb-4 rounded-2xl bg-white/60 p-4 backdrop-blur-sm shadow-sm">
          <OfficeStatus />
          <div className="mt-3 pt-3 border-t border-sky-200/50 text-xs text-sky-600">
            <p>Pon - Pet: 07:00 - 15:00</p>
            <p className="text-sky-500">Dravska 7, 42231 Mali Bukovec</p>
          </div>
        </div>

        {/* AI Assistant Mini Widget */}
        <button
          className="flex-1 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-4 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer text-left"
          onClick={() => {/* TODO: Open full chatbot */}}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Virtualni asistent</h3>
              <p className="text-xs text-white/70">Kliknite za razgovor</p>
            </div>
            <span className="ml-auto text-[10px] bg-amber-400/30 text-amber-100 px-2 py-1 rounded-full">Uskoro</span>
          </div>

          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
              <span className="text-[10px]">AI</span>
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white/10 px-3 py-2 text-sm">
              Kako vam mogu pomoći? 👋
            </div>
          </div>
        </button>

        {/* Emergency Contacts */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <a href="tel:112" className="flex items-center gap-1.5 text-sky-700 hover:text-sky-900 transition-colors">
            <Phone className="h-3 w-3" />
            <span className="text-red-600 font-medium">Hitna: 112</span>
          </a>
          <a href="tel:042840040" className="flex items-center gap-1.5 text-sky-700 hover:text-sky-900 transition-colors">
            <Phone className="h-3 w-3" />
            <span>Općina: 042 840 040</span>
          </a>
        </div>
      </div>
    </div>
  );
}
