import React, { useState } from 'react';
import {
  useWeather, getWeatherIcon, getWeatherDescription, toDisplayTemp,
} from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import { Search, RefreshCw, MapPin, Wind, Droplets, Thermometer, ExternalLink } from 'lucide-react';

export const WeatherWindow: React.FC = () => {
  const { theme } = useTheme();
  const { location, weather, isLoading, error, unit, setUnit, searchLocation, refresh } = useWeather();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(!location);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchError(null);
    const err = await searchLocation(searchQuery.trim());
    if (err === null) {
      setShowSearch(false);
      setSearchQuery('');
    } else {
      setSearchError(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const toggleSearch = () => {
    setShowSearch(s => !s);
    setSearchError(null);
  };

  const formatHour = (timeStr: string) =>
    new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'TODAY';
    if (d.toDateString() === tomorrow.toDateString()) return 'TMRW';
    return d.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
  };

  return (
    <div className="p-3 flex flex-col gap-3 min-h-0 overflow-y-auto" style={{ color: theme.primary }}>

      {/* Location bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex-1 min-w-0 flex items-center gap-2 win95-inset px-2 py-1.5">
          <MapPin className="w-3 h-3 opacity-50 flex-shrink-0" />
          {location ? (
            <span className="text-xs font-bold truncate">{location.name}, {location.country}</span>
          ) : (
            <span className="text-xs opacity-40 font-bold">NO LOCATION SET</span>
          )}
        </div>
        <button
          onClick={toggleSearch}
          className={`win95-outset px-2 py-1.5 text-xs font-bold active:win95-inset hover:bg-white/5 ${showSearch ? 'win95-inset' : ''}`}
          title="Set location"
        >
          <Search className="w-3 h-3" />
        </button>
        {location && (
          <button
            onClick={refresh}
            className="win95-outset px-2 py-1.5 active:win95-inset hover:bg-white/5"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
        <button
          onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
          className="win95-outset px-2 py-1.5 text-[10px] font-bold active:win95-inset hover:bg-white/5 w-8 text-center"
          title="Toggle units"
        >
          {unit === 'celsius' ? '°C' : '°F'}
        </button>
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="City name, e.g. Buffalo NY"
              className="win95-inset flex-1 px-2 py-1.5 text-xs font-bold bg-transparent outline-none"
              style={{ color: theme.primary }}
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="win95-outset px-3 py-1.5 text-[10px] font-bold active:win95-inset hover:bg-white/5 disabled:opacity-40 tracking-wider"
            >
              {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'SET'}
            </button>
          </div>
          {searchError && (
            <div className="text-[10px] font-bold px-1" style={{ color: '#f87171' }}>
              {searchError}
            </div>
          )}
        </div>
      )}

      {/* No location prompt */}
      {!location && !showSearch && (
        <div className="flex flex-col items-center justify-center gap-3 py-10 opacity-50">
          <MapPin className="w-10 h-10" />
          <span className="text-xs font-bold tracking-widest">SET A LOCATION TO VIEW WEATHER</span>
        </div>
      )}

      {/* Error */}
      {error && !weather && !isLoading && (
        <div className="text-xs font-bold win95-inset px-3 py-2" style={{ color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Initial loading */}
      {isLoading && !weather && (
        <div className="flex items-center gap-2 text-xs font-bold opacity-50 py-4 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" />
          FETCHING WEATHER...
        </div>
      )}

      {/* Weather content */}
      {weather && (
        <>
          {/* Current conditions */}
          {(() => {
            const WeatherIcon = getWeatherIcon(weather.weatherCode);
            return (
              <div className="win95-outset p-3 flex items-center gap-4">
                <WeatherIcon className="w-14 h-14 flex-shrink-0" style={{ color: theme.accent }} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-4xl font-bold leading-none">
                    {toDisplayTemp(weather.temperature, unit)}
                  </span>
                  <span className="text-xs font-bold opacity-70 tracking-wide">
                    {getWeatherDescription(weather.weatherCode)}
                  </span>
                </div>
                <div className="ml-auto flex flex-col gap-1.5 text-[10px] font-bold opacity-60 text-right">
                  <span className="flex items-center gap-1 justify-end">
                    <Thermometer className="w-3 h-3" />
                    Feels {toDisplayTemp(weather.feelsLike, unit)}
                  </span>
                  <span className="flex items-center gap-1 justify-end">
                    <Droplets className="w-3 h-3" />
                    {weather.humidity}% humidity
                  </span>
                  <span className="flex items-center gap-1 justify-end">
                    <Wind className="w-3 h-3" />
                    {Math.round(weather.windSpeed)} km/h
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Hourly forecast */}
          {weather.hourly.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-bold opacity-50 tracking-widest">NEXT 24 HOURS</div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {weather.hourly.map((h, i) => {
                  const HIcon = getWeatherIcon(h.code);
                  return (
                    <div
                      key={i}
                      className="win95-inset flex flex-col items-center gap-1 px-2 py-2 min-w-[54px] text-center flex-shrink-0"
                    >
                      <span className="text-[9px] opacity-50 font-bold">{formatHour(h.time)}</span>
                      <HIcon className="w-4 h-4" />
                      <span className="text-[10px] font-bold">{toDisplayTemp(h.temp, unit)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily forecast */}
          {weather.daily.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-bold opacity-50 tracking-widest">
                {weather.daily.length}-DAY FORECAST
              </div>
              <div className="flex flex-col gap-0.5">
                {weather.daily.map((d, i) => {
                  const DIcon = getWeatherIcon(d.code);
                  return (
                    <div key={i} className="win95-inset flex items-center gap-3 px-3 py-2">
                      <span className="text-[10px] font-bold w-9 opacity-80">{formatDay(d.date)}</span>
                      <DIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[10px] flex-1 opacity-55">{getWeatherDescription(d.code)}</span>
                      <span className="text-[10px] font-bold opacity-60">{toDisplayTemp(d.minTemp, unit)}</span>
                      <span className="mx-0.5 text-[10px] opacity-30">/</span>
                      <span className="text-[10px] font-bold">{toDisplayTemp(d.maxTemp, unit)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            {location && (
              <a
                href={`https://wttr.in/${encodeURIComponent(location.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="win95-outset px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 hover:bg-white/5 active:win95-inset tracking-wide"
                style={{ color: theme.secondary }}
              >
                <ExternalLink className="w-3 h-3" />
                OPEN FULL REPORT
              </a>
            )}
            <span className="text-[9px] opacity-35 font-bold ml-auto">
              UPDATED {new Date(weather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
