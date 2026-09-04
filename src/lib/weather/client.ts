import "server-only";

// Open-Meteo — free, no API key/account required, which avoids yet another
// manual dashboard signup for a feature this small. Non-commercial-friendly
// and fine for a 2-person app.

export type GeocodeResult = {
  label: string;
  lat: number;
  lng: number;
};

export async function searchCities(query: string): Promise<GeocodeResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const results: unknown[] = Array.isArray(data.results) ? data.results : [];
  return results.map((r) => {
    const row = r as { name?: string; admin1?: string; country?: string; latitude: number; longitude: number };
    return {
      label: [row.name, row.admin1, row.country].filter(Boolean).join(", "),
      lat: row.latitude,
      lng: row.longitude,
    };
  });
}

export type CurrentWeather = {
  temperatureC: number;
  weatherCode: number;
};

export async function fetchCurrentWeather(lat: number, lng: number): Promise<CurrentWeather | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`;
  // Cache 30 min per the phase brief, via Next.js's fetch cache rather than
  // a hand-rolled cache layer.
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.current) return null;
  return {
    temperatureC: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
  };
}

const WEATHER_LABELS: Record<number, { label: string; emoji: string }> = {
  0: { label: "clear", emoji: "☀️" },
  1: { label: "mostly clear", emoji: "🌤" },
  2: { label: "partly cloudy", emoji: "⛅" },
  3: { label: "overcast", emoji: "☁️" },
  45: { label: "foggy", emoji: "🌫" },
  48: { label: "foggy", emoji: "🌫" },
  51: { label: "light drizzle", emoji: "🌦" },
  53: { label: "drizzle", emoji: "🌦" },
  55: { label: "heavy drizzle", emoji: "🌧" },
  61: { label: "light rain", emoji: "🌧" },
  63: { label: "rain", emoji: "🌧" },
  65: { label: "heavy rain", emoji: "🌧" },
  71: { label: "light snow", emoji: "🌨" },
  73: { label: "snow", emoji: "🌨" },
  75: { label: "heavy snow", emoji: "❄️" },
  80: { label: "rain showers", emoji: "🌦" },
  81: { label: "rain showers", emoji: "🌦" },
  82: { label: "violent showers", emoji: "⛈" },
  95: { label: "thunderstorm", emoji: "⛈" },
};

export function describeWeatherCode(code: number): { label: string; emoji: string } {
  return WEATHER_LABELS[code] ?? { label: "weather", emoji: "🌡" };
}
