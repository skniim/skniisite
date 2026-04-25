import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Sun, Cloud, Cloudy, CloudSun, CloudFog, CloudDrizzle,
  CloudRain, CloudSnow, CloudLightning, CloudHail, type LucideIcon
} from 'lucide-react';

export interface WeatherLocation {
  name: string;        // "Buffalo, New York"
  country: string;     // "United States of America"
  query: string;       // wttr.in query ("lat,lon" after first resolve)
  latitude: number;
  longitude: number;
}

export interface HourlyWeather {
  time: string;        // ISO datetime string
  temp: number;        // celsius
  code: number;
  description: string;
}

export interface DailyWeather {
  date: string;
  maxTemp: number;     // celsius
  minTemp: number;     // celsius
  code: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  lastUpdated: number;
}

interface WeatherContextType {
  location: WeatherLocation | null;
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  unit: 'celsius' | 'fahrenheit';
  setUnit: (unit: 'celsius' | 'fahrenheit') => void;
  setLocation: (loc: WeatherLocation) => void;
  searchLocation: (query: string) => Promise<string | null>; // null = success, string = error
  refresh: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

const REFRESH_INTERVAL = 30 * 60 * 1000;

// WWO/wttr.in weather codes → icons
export const getWeatherIcon = (code: number): LucideIcon => {
  if (code === 113) return Sun;
  if (code === 116) return CloudSun;
  if (code === 119 || code === 122) return Cloudy;
  if (code === 143 || code === 248 || code === 260) return CloudFog;
  if (code === 176 || (code >= 263 && code <= 284)) return CloudDrizzle;
  if ((code >= 293 && code <= 314) || (code >= 353 && code <= 359)) return CloudRain;
  if ((code >= 317 && code <= 350) || (code >= 362 && code <= 395 && code % 2 === 0)) return CloudSnow;
  if ((code >= 323 && code <= 371) || code === 227 || code === 230) return CloudSnow;
  if (code === 200 || code >= 386) return CloudLightning;
  if (code >= 374 && code <= 377) return CloudHail;
  return Cloud;
};

export const getWeatherDescription = (code: number): string => {
  if (code === 113) return 'Clear Sky';
  if (code === 116) return 'Partly Cloudy';
  if (code === 119) return 'Cloudy';
  if (code === 122) return 'Overcast';
  if (code === 143) return 'Mist';
  if (code === 176) return 'Patchy Rain';
  if (code === 200) return 'Possible Thunder';
  if (code === 227 || code === 230) return 'Blizzard';
  if (code === 248 || code === 260) return 'Fog';
  if (code >= 263 && code <= 266) return 'Light Drizzle';
  if (code >= 281 && code <= 284) return 'Freezing Drizzle';
  if (code >= 293 && code <= 296) return 'Light Rain';
  if (code >= 299 && code <= 302) return 'Moderate Rain';
  if (code >= 305 && code <= 308) return 'Heavy Rain';
  if (code >= 311 && code <= 314) return 'Freezing Rain';
  if (code >= 317 && code <= 320) return 'Sleet';
  if (code >= 323 && code <= 338) return 'Snow';
  if (code >= 350 && code <= 377) return 'Showers';
  if (code >= 386) return 'Thunderstorm';
  return 'Unknown';
};

export const toDisplayTemp = (celsius: number, unit: 'celsius' | 'fahrenheit'): string => {
  if (unit === 'fahrenheit') return `${Math.round(celsius * 9 / 5 + 32)}°F`;
  return `${Math.round(celsius)}°C`;
};

const parseWttrData = (data: any, now: Date): { location: WeatherLocation; weather: WeatherData } | null => {
  try {
    const area = data.nearest_area?.[0];
    const current = data.current_condition?.[0];
    if (!area || !current) return null;

    const lat = parseFloat(area.latitude);
    const lon = parseFloat(area.longitude);
    const location: WeatherLocation = {
      name: `${area.areaName[0].value}, ${area.region[0].value}`,
      country: area.country[0].value,
      query: `${lat.toFixed(4)},${lon.toFixed(4)}`,
      latitude: lat,
      longitude: lon,
    };

    // Build hourly list from today + tomorrow
    const hourly: HourlyWeather[] = [];
    const days: any[] = data.weather ?? [];
    for (let di = 0; di < Math.min(days.length, 2); di++) {
      const day = days[di];
      const dateStr = day.date; // "2026-04-25"
      for (const h of (day.hourly ?? [])) {
        const hour = Math.floor(parseInt(h.time) / 100);
        const iso = `${dateStr}T${String(hour).padStart(2, '0')}:00`;
        hourly.push({
          time: iso,
          temp: parseInt(h.tempC),
          code: parseInt(h.weatherCode),
          description: h.weatherDesc?.[0]?.value?.trim() ?? '',
        });
      }
    }
    const filteredHourly = hourly
      .filter(h => new Date(h.time).getTime() >= now.getTime())
      .slice(0, 24);

    // Build daily list (3 days from wttr.in)
    const daily: DailyWeather[] = days.map((d: any) => ({
      date: d.date,
      maxTemp: parseInt(d.maxtempC),
      minTemp: parseInt(d.mintempC),
      // use midday entry (index 4 = 12:00) for the day's representative code
      code: parseInt(d.hourly?.[4]?.weatherCode ?? d.hourly?.[0]?.weatherCode ?? 113),
    }));

    const weather: WeatherData = {
      temperature: parseInt(current.temp_C),
      feelsLike: parseInt(current.FeelsLikeC),
      humidity: parseInt(current.humidity),
      windSpeed: parseInt(current.windspeedKmph),
      weatherCode: parseInt(current.weatherCode),
      hourly: filteredHourly,
      daily,
      lastUpdated: Date.now(),
    };

    return { location, weather };
  } catch {
    return null;
  }
};

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<WeatherLocation | null>(() => {
    const saved = localStorage.getItem('sknii-weather-location');
    if (saved) { try { return JSON.parse(saved); } catch { return null; } }
    return null;
  });

  const [unit, setUnitState] = useState<'celsius' | 'fahrenheit'>(() => {
    return (localStorage.getItem('sknii-weather-unit') as 'celsius' | 'fahrenheit') || 'fahrenheit';
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (query: string): Promise<{ location: WeatherLocation; weather: WeatherData; } | { error: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `https://wttr.in/${encodeURIComponent(query)}?format=j1`;
      console.log('[Weather] fetching', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('[Weather] raw data keys:', Object.keys(data));
      const parsed = parseWttrData(data, new Date());
      if (!parsed) throw new Error('Unexpected response format from wttr.in');
      setWeather(parsed.weather);
      return parsed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch weather';
      console.error('[Weather] fetch error:', err);
      setError(msg);
      return { error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!location) return;
    fetchWeather(location.query);
    const interval = setInterval(() => fetchWeather(location.query), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [location?.query, fetchWeather]);

  const searchLocation = useCallback(async (query: string): Promise<string | null> => {
    const result = await fetchWeather(query.trim());
    if ('error' in result) return result.error;
    setLocationState(result.location);
    localStorage.setItem('sknii-weather-location', JSON.stringify(result.location));
    return null; // success
  }, [fetchWeather]);

  const setUnit = (u: 'celsius' | 'fahrenheit') => {
    setUnitState(u);
    localStorage.setItem('sknii-weather-unit', u);
  };

  const setLocation = (loc: WeatherLocation) => {
    setLocationState(loc);
    localStorage.setItem('sknii-weather-location', JSON.stringify(loc));
  };

  const refresh = () => { if (location) fetchWeather(location.query); };

  return (
    <WeatherContext.Provider value={{ location, weather, isLoading, error, unit, setUnit, setLocation, searchLocation, refresh }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
};
