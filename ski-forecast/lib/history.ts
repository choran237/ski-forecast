// lib/history.ts
import { kv } from "@vercel/kv";
import { ForecastRun } from "./resorts";

const KEY = "ski:history";
const MAX_RUNS = 6;

export async function getHistory(): Promise<ForecastRun[]> {
  try {
    const data = await kv.get<ForecastRun[]>(KEY);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function appendRun(run: ForecastRun): Promise<ForecastRun[]> {
  const history = await getHistory();
  const updated = [run, ...history].slice(0, MAX_RUNS);
  await kv.set(KEY, updated);
  return updated;
}
