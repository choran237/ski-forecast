// lib/history.ts
import { Redis } from "@upstash/redis";
import { ForecastRun } from "./resorts";

const KEY = "ski:history";
const MAX_RUNS = 6;

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getHistory(): Promise<ForecastRun[]> {
  try {
    const redis = getRedis();
    const data = await redis.get<ForecastRun[]>(KEY);
    return data ?? [];
  } catch {
    return [];
  }
}

function runsAreIdentical(a: ForecastRun, b: ForecastRun): boolean {
  for (const resortA of a.resorts) {
    const resortB = b.resorts.find(r => r.resort_id === resortA.resort_id);
    if (!resortB) return false;
    if (resortA.forecast.total_7day_snow_cm !== resortB.forecast.total_7day_snow_cm) return false;
    const daysA = [...resortA.forecast.next_3_days, ...resortA.forecast.following_4_days];
    const daysB = [...resortB.forecast.next_3_days, ...resortB.forecast.following_4_days];
    for (let i = 0; i < daysA.length; i++) {
      if (daysA[i].snowfall_cm !== daysB[i].snowfall_cm) return false;
      if (daysA[i].snow_depth_cm !== daysB[i].snow_depth_cm) return false;
    }
  }
  return true;
}

export async function appendRun(run: ForecastRun): Promise<{ history: ForecastRun[]; stored: boolean }> {
  const redis = getRedis();
  const history = await getHistory();

  if (history.length > 0 && runsAreIdentical(run, history[0])) {
    return { history, stored: false };
  }

  const updated = [run, ...history].slice(0, MAX_RUNS);
  await redis.set(KEY, updated);
  return { history: updated, stored: true };
}
