"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { scalePress, springSlow, useReducedMotionSafe } from "@/lib/motion";
import { searchCity, setMyLocation, type PartnerWeather } from "@/lib/weather/actions";
import type { GeocodeResult } from "@/lib/weather/client";

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
  const { transition } = useReducedMotionSafe();

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transition(springSlow)}
        className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-lilac/30 to-paper2 px-5 py-4"
      >
        <span className="text-3xl" aria-hidden="true">
          {initialWeather.emoji}
        </span>
        <div>
          <p className="font-display text-xl text-ink">{initialWeather.temperatureC}°</p>
          <p className="font-sans text-xs text-ink/70">
            {initialWeather.label} where {partnerName} is
            {initialWeather.locationLabel ? ` (${initialWeather.locationLabel})` : ""}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-line bg-paper2 px-5 py-4">
      <p className="font-sans text-xs text-ink/70">
        add your city so {partnerName} sees a hint of your weather
      </p>
      <input
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="search for your city"
        aria-label="search for your city"
        className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
      />
      {results.length > 0 && (
        <ul className="flex flex-col gap-1">
          {results.map((result) => (
            <li key={`${result.lat}-${result.lng}`}>
              <motion.button
                variants={scalePress}
                initial="rest"
                whileTap="tap"
                type="button"
                onClick={() => handlePick(result)}
                disabled={isPending}
                className="w-full rounded-lg px-3 py-2 text-left font-sans text-xs text-ink hover:bg-paper"
              >
                {result.label}
              </motion.button>
            </li>
          ))}
        </ul>
      )}
      {saved && <p className="font-sans text-xs text-ink">saved — thanks!</p>}
    </div>
  );
}
