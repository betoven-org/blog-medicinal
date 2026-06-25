"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  temperature: number;
  city: string;
};

type StoredLocation = {
  lat: number;
  lon: number;
  city: string;
  timestamp: number;
};

const STORAGE_KEY = "user_location";
const LOCATION_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

function IconThermometer({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

function IconLocation({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`,
      { headers: { "User-Agent": "MedicinalNaWeb/1.0" } }
    );
    if (!res.ok) return "Sua cidade";
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      "Sua cidade"
    );
  } catch {
    return "Sua cidade";
  }
}

async function fetchTemperature(lat: number, lon: number): Promise<number> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
  );
  if (!res.ok) throw new Error("Erro ao buscar temperatura");
  const data = await res.json();
  return Math.round(data.current.temperature_2m);
}

function getStoredLocation(): StoredLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredLocation = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > LOCATION_MAX_AGE) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeLocation(loc: StoredLocation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // quota exceeded — ignore
  }
}

export function WeatherWidget({ buttonText = "Ver temperatura local" }: { buttonText?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setAsked(true);
      fetchTemperature(stored.lat, stored.lon)
        .then((temp) => setWeather({ temperature: temp, city: stored.city }))
        .catch(() => {});
    }
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }

    setLoading(true);
    setAsked(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const [temp, city] = await Promise.all([
          fetchTemperature(lat, lon),
          reverseGeocode(lat, lon),
        ]);

        storeLocation({ lat, lon, city, timestamp: Date.now() });
        setWeather({ temperature: temp, city });
        setLoading(false);
      },
      () => {
        setDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  if (denied) return null;

  if (weather) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <IconLocation size={12} />
        <span>{weather.city}</span>
        <IconThermometer size={12} />
        <span className="font-medium">{weather.temperature}°C</span>
      </div>
    );
  }

  if (!asked) {
    return (
      <button
        onClick={requestLocation}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-[#0d61ac]"
      >
        <IconLocation size={12} />
        {loading ? "Localizando..." : buttonText}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <IconLocation size={12} />
        <span>Localizando...</span>
      </div>
    );
  }

  return null;
}
