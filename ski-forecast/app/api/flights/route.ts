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
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached);
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

    const result = {
      ok: true,
      price: best.price,
      airline: leg?.airline,
      duration_mins: best.total_duration,
      departure_airport: from,
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
