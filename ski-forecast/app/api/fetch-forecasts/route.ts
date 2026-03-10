// app/api/fetch-forecasts/route.ts
import { NextResponse } from "next/server";
import { RESORTS } from "@/lib/resorts";
import { fetchResortForecast } from "@/lib/open-meteo";
import { appendRun } from "@/lib/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds — needed for 56 resorts

// Fetch in batches of 10 to avoid timeouts
async function fetchInBatches(batchSize = 10) {
  const results = [];
  for (let i = 0; i < RESORTS.length; i += batchSize) {
    const batch = RESORTS.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchResortForecast));
    results.push(...batchResults);
  }
  return results;
}

export async function GET() {
  try {
    const resorts = await fetchInBatches(10);

    const run = {
      fetched_at: new Date().toISOString(),
      resorts,
    };

    const { history, stored } = await appendRun(run);

    return NextResponse.json({ ok: true, run, history, stored });
  } catch (err: any) {
    console.error("fetch-forecasts error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
