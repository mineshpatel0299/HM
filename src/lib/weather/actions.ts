"use server";

import { eq } from "drizzle-orm";
import { assertCoupleMember } from "@/lib/db/assertCoupleMember";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getDb, withDbRetry } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import {
  describeWeatherCode,
  fetchCurrentWeather,
  searchCities,
  type GeocodeResult,
} from "./client";

export async function searchCity(query: string): Promise<GeocodeResult[]> {
  if (query.trim().length < 2) return [];
  return searchCities(query.trim());
}

type SetLocationResult = { ok: true } | { ok: false; error: string };

export async function setMyLocation(
  coupleId: string,
  location: GeocodeResult,
): Promise<SetLocationResult> {
  const { userId } = await assertCoupleMember(coupleId);

  const db = getDb();
  await withDbRetry(() =>
    db
      .update(profiles)
      .set({ locationLat: location.lat, locationLng: location.lng, locationLabel: location.label })
      .where(eq(profiles.id, userId)),
  );

  return { ok: true };
}

export type PartnerWeather = {
  temperatureC: number;
  label: string;
  emoji: string;
  locationLabel: string;
} | null;

export async function getPartnerWeather(coupleId: string): Promise<PartnerWeather> {
  await assertCoupleMember(coupleId);
  const context = await getCoupleContext();
  if (!context?.partnerId) return null;

  const db = getDb();
  const [partner] = await withDbRetry(() =>
    db
      .select({
        locationLat: profiles.locationLat,
        locationLng: profiles.locationLng,
        locationLabel: profiles.locationLabel,
      })
      .from(profiles)
      .where(eq(profiles.id, context.partnerId!))
      .limit(1),
  );

  if (!partner?.locationLat || !partner.locationLng) return null;

  const weather = await fetchCurrentWeather(partner.locationLat, partner.locationLng);
  if (!weather) return null;

  const { label, emoji } = describeWeatherCode(weather.weatherCode);
  return {
    temperatureC: Math.round(weather.temperatureC),
    label,
    emoji,
    locationLabel: partner.locationLabel ?? "",
  };
}
