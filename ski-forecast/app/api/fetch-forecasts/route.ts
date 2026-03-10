// app/api/fetch-forecasts/route.ts
import { NextResponse } from "next/server";
import { RESORTS } from "@/lib/resorts";
import { fetchResortForecast } from "@/lib/open-meteo";
import { appendRun } from "@/lib/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all resorts in parallel
    const resorts = await Promise.all(RESORTS.map(fetchResortForecast));

    const run = {
      fetched_at: new Date().toISOString(),
      resorts,
    };

    const history = await appendRun(run);

    return NextResponse.json({ ok: true, run, history });
  } catch (err: any) {
    console.error("fetch-forecasts error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
