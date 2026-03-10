import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SERP_API_KEY = process.env.SERP_API_KEY!;
const CACHE_TTL = 60 * 60 * 6; // 6 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const airport = searchParams.get("airport");
  const depart = searchParams.get("depart");
  const ret = searchParams.get("return");
  const from = (searchParams.get("from") || "LHR").toUpperCase();

  if (!airport || !depart || !ret) {
    return NextResponse.json({ ok: false, error: "Missing params" }, { status: 400 });
  }

  const cacheKey = `flight:${from}:${airport}:${depart}:${ret}`;

  // Check Redis cache
  try {
    const cached = await redis.get<any>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  } catch {}

  // Call SerpApi
  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: from,
    arrival_id: airport,
    outbound_date: depart,
    return_date: ret,
    currency: "GBP",
    hl: "en",
    stops: "0",
    api_key: SERP_API_KEY,
  });

  try {
    const res = await fetch(`https://serpapi.com/search?${params}`);
    const data = await res.json();

    if (!data.best_flights?.length && !data.other_flights?.length) {
      return NextResponse.json({ ok: false, error: "No direct flights found" });
    }

    const flights = data.best_flights || data.other_flights;
    const best = flights[0];
    const leg = best.flights?.[0];

    // stops = number of layovers (legs - 1). With stops:"0" this should always be 0,
    // but we derive it from actual legs so the UI is always accurate.
    const legCount = best.flights?.length ?? 1;
    const stops = legCount - 1;

    const result = {
      ok: true,
      price: best.price,
      price_level: best.price_level ?? null,
      airline: leg?.airline ?? best.flights?.map((f: any) => f.airline).join(", "),
      duration_mins: best.total_duration,
      stops,
      departure_airport: from,
      cached: false,
    };

    // Cache for 6 hours
    try {
      await redis.set(cacheKey, result, { ex: CACHE_TTL });
    } catch {}

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: "API error" }, { status: 500 });
  }
}
