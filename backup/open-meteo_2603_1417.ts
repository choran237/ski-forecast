// lib/open-meteo.ts
import { Resort, ResortSnapshot, DayForecast } from "./resorts";

const FIELDS = "snowfall_sum,snow_depth_max,precipitation_probability_max,temperature_2m_max,temperature_2m_min";

// Open-Meteo ignores the &elevation= override for snow_depth — it uses its own DEM
// and snaps to the actual terrain at that lat/lng. So fetching at the same coords
// with a different elevation just returns the same terrain-based value.
//
// Instead we estimate summit snow depth using an elevation-based scaling factor.
// Snow depth increases with altitude due to:
//   - Lower temps (less melt): ~0.6°C per 100m lapse rate
//   - Orographic enhancement of precipitation at higher elevations
// Empirically, ski resorts typically see 1.3–1.8x more snow depth at summit vs mid-mountain.
// We use a conservative 1.4x per 1000m above base, capped at 2.5x.
function estimateSummitDepth(baseDepthCm: number, baseElevationM: number, summitElevationM: number): number {
  if (baseDepthCm <= 0) return 0;
  const elevationGainM = Math.max(0, summitElevationM - baseElevationM);
  const scaleFactor = Math.min(2.5, 1 + (elevationGainM / 1000) * 0.4);
  return Math.round(baseDepthCm * scaleFactor);
}

export async function fetchResortForecast(resort: Resort): Promise<ResortSnapshot> {
  // Single fetch at mid-mountain elevation
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${resort.lat}&longitude=${resort.lng}` +
    `&elevation=${resort.elevation_m}` +
    `&daily=${FIELDS}` +
    `&forecast_days=10&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Open-Meteo failed for ${resort.name}: ${res.status}`);

  const data = await res.json();
  const d = data.daily;

  const days: DayForecast[] = d.time.map((date: string, i: number) => ({
    date,
    snowfall_cm:   Math.round((d.snowfall_sum[i]                    ?? 0) * 10) / 10,
    snow_depth_cm: Math.round((d.snow_depth_max[i]                  ?? 0) * 100),
    precip_prob:   d.precipitation_probability_max[i]               ?? 0,
    temp_max:      Math.round((d.temperature_2m_max[i]              ?? 0) * 10) / 10,
    temp_min:      Math.round((d.temperature_2m_min[i]              ?? 0) * 10) / 10,
  }));

  const total = days.reduce((s, d) => s + d.snowfall_cm, 0);
  const baseDepth = days[0]?.snow_depth_cm ?? 0;

  // Estimate summit depth from base using elevation lapse scaling
  const summitDepth = estimateSummitDepth(baseDepth, resort.elevation_m, resort.summit_elevation_m);

  return {
    resort_id:        resort.id,
    resort_name:      resort.name,
    country:          resort.country,
    fetched_at:       new Date().toISOString(),
    composite_rating: resort.composite_rating,
    lifts: {
      total: resort.total_lifts,
      open:  Math.floor(resort.total_lifts * 0.82),
    },
    private_instruction: {
      price_per_hour: resort.private_per_hour,
      currency:       resort.currency,
    },
    summit_snow_depth_cm: summitDepth,
    forecast: {
      next_3_days:         days.slice(0, 3),
      following_7_days:    days.slice(3, 10),
      total_10day_snow_cm: total.toFixed(1),
    },
  };
}
