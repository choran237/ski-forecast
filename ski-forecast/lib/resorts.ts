// lib/resorts.ts
// ─── Add or remove resorts here ───────────────────────────────────────────────

export interface Resort {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  composite_rating: number;
  total_lifts: number;
  private_per_hour: number;
  currency: string;
}

export const RESORTS: Resort[] = [
  { id: "verbier",     name: "Verbier",     country: "CH", lat: 46.0963, lng: 7.2275,  composite_rating: 4.7, total_lifts: 87,  private_per_hour: 150, currency: "CHF" },
  { id: "val_thorens", name: "Val Thorens", country: "FR", lat: 45.2975, lng: 6.5837,  composite_rating: 4.5, total_lifts: 141, private_per_hour: 85,  currency: "EUR" },
  { id: "st_anton",    name: "St. Anton",   country: "AT", lat: 47.1296, lng: 10.2686, composite_rating: 4.6, total_lifts: 88,  private_per_hour: 95,  currency: "EUR" },
  { id: "zermatt",     name: "Zermatt",     country: "CH", lat: 46.0207, lng: 7.7491,  composite_rating: 4.8, total_lifts: 52,  private_per_hour: 160, currency: "CHF" },
  { id: "chamonix",    name: "Chamonix",    country: "FR", lat: 45.9237, lng: 6.8694,  composite_rating: 4.4, total_lifts: 49,  private_per_hour: 90,  currency: "EUR" },
];

// ─── Shared data types ─────────────────────────────────────────────────────────

export interface DayForecast {
  date: string;
  snowfall_cm: number;
  snow_depth_cm: number;
  precip_prob: number;
  temp_max: number;
  temp_min: number;
}

export interface ResortSnapshot {
  resort_id: string;
  resort_name: string;
  country: string;
  fetched_at: string;
  composite_rating: number;
  lifts: { total: number; open: number };
  private_instruction: { price_per_hour: number; currency: string };
  forecast: {
    next_3_days: DayForecast[];
    following_4_days: DayForecast[];
    total_7day_snow_cm: string;
  };
}

export interface ForecastRun {
  fetched_at: string;
  resorts: ResortSnapshot[];
}
