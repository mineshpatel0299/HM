"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { searchCity, setMyLocation, type PartnerWeather } from "@/lib/weather/actions";
import type { GeocodeResult } from "@/lib/weather/client";
import { CloudSun, MapPin, Search, CheckCircle2 } from "lucide-react";

export function WeatherBridge({
  coupleId,
  partnerName,
  initialWeather,
}: {
  coupleId: string;
  partnerName: string;
  initialWeather: PartnerWeather;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const found = await searchCity(value);
      setResults(found);
    });
  }

  function handlePick(result: GeocodeResult) {
    startTransition(async () => {
      const res = await setMyLocation(coupleId, result);
      if (res.ok) {
        setSaved(true);
        setResults([]);
        setQuery(result.label);
      }
    });
  }

  if (initialWeather) {
    return (
      <div className="relative flex items-center justify-between gap-4 rounded-3xl glass-card p-5 border border-white/80 shadow-glass overflow-hidden group">
        {/* Sky Ambient Light Effect */}
        <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-gradient-to-tr from-amber/30 to-ember/20 blur-2xl group-hover:scale-125 transition-transform duration-500" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-100 to-rose-100 text-3xl shadow-sm border border-white/60">
            {initialWeather.emoji || "☀️"}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl font-bold text-ink tracking-tight">
                {initialWeather.temperatureC}°C
              </span>
              <span className="text-xs font-sans font-semibold text-ink-muted">
                / {Math.round((initialWeather.temperatureC * 9) / 5 + 32)}°F
              </span>
            </div>
            <p className="font-sans text-xs font-medium text-ink-muted flex items-center gap-1">
              <span>{initialWeather.label}</span>
              <span>•</span>
              <span className="text-ink font-semibold">{partnerName}&apos;s sky</span>
            </p>
            {initialWeather.locationLabel && (
              <span className="text-[11px] font-sans text-ink-muted/80 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-ember" />
                {initialWeather.locationLabel}
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 hidden sm:flex flex-col items-end text-right">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-ember bg-ember/10 px-2.5 py-1 rounded-full border border-ember/20">
            Live Weather
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl glass-card p-5 border border-white/80 shadow-glass">
      <div className="flex items-center gap-2">
        <CloudSun className="h-5 w-5 text-amber" />
        <p className="font-sans text-xs font-medium text-ink">
          Add your city so <span className="font-semibold text-ember">{partnerName}</span> sees your local weather
        </p>
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Search your city..."
          aria-label="Search for your city"
          className="w-full rounded-2xl glass-input px-4 py-2.5 pl-10 font-sans text-xs text-ink placeholder:text-ink-muted outline-none"
        />
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
      </div>

      {results.length > 0 && (
        <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto rounded-2xl bg-white/90 p-1.5 border border-line shadow-lg">
          {results.map((result) => (
            <li key={`${result.lat}-${result.lng}`}>
              <motion.button
                variants={scalePress}
                initial="rest"
                whileTap="tap"
                type="button"
                onClick={() => handlePick(result)}
                disabled={isPending}
                className="w-full rounded-xl px-3 py-2 text-left font-sans text-xs text-ink hover:bg-paper2 transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-ember shrink-0" />
                <span>{result.label}</span>
              </motion.button>
            </li>
          ))}
        </ul>
      )}

      {saved && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-sans font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Location saved successfully!</span>
        </div>
      )}
    </div>
  );
}
