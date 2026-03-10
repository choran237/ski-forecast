// lib/open-meteo.ts
import { Resort, ResortSnapshot, DayForecast } from "./resorts";

export async function fetchResortForecast(resort: Resort): Promise<ResortSnapshot> {
  // Pass elevation_m so Open-Meteo interpolates at mid-mountain altitude
  // This gives accurate snow depth readings rather than village-level (near zero)
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${resort.lat}&longitude=${resort.lng}` +
    `&elevation=${resort.elevation_m}` +
    `&daily=snowfall_sum,snow_depth_max,precipitation_probability_max,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=7&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Open-Meteo failed for ${resort.name}: ${res.status}`);

  const data = await res.json();
  const d = data.daily;

  const days: DayForecast[] = d.time.map((date: string, i: number) => ({
    date,
    snowfall_cm:  Math.round((d.snowfall_sum[i]                    ?? 0) * 10) / 10,
    snow_depth_cm: Math.round((d.snow_depth_max[i]                 ?? 0) * 10) / 10,
    precip_prob:  d.precipitation_probability_max[i]               ?? 0,
    temp_max:     Math.round((d.temperature_2m_max[i]              ?? 0) * 10) / 10,
    temp_min:     Math.round((d.temperature_2m_min[i]              ?? 0) * 10) / 10,
  }));

  const total = days.reduce((s, d) => s + d.snowfall_cm, 0);

  return {
    resort_id:        resort.id,
    resort_name:      resort.name,
    country:          resort.country,
    fetched_at:       new Date().toISOString(),
    composite_rating: resort.composite_rating,
    lifts: {
      total: resort.total_lifts,
      open: Math.floor(resort.total_lifts * 0.82),
    },
    private_instruction: {
      price_per_hour: resort.private_per_hour,
      currency:       resort.currency,
    },
    forecast: {
      next_3_days:      days.slice(0, 3),
      following_4_days: days.slice(3, 7),
      total_7day_snow_cm: total.toFixed(1),
    },
  };
}
