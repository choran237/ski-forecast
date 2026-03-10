// app/api/flights/route.ts
// Fetches LHR → resort airport prices via SerpApi Google Flights
// Caches results in Redis for 6 hours to avoid burning API credits
// Also stores historical prices for display when cache is cold

import { NextRequest, NextResponse } from "next/server";

const SERP_API_KEY = process.env.SERP_API_KEY!;
const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

// Helper: get next Friday from today
function nextFriday(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 5=Fri
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  return d.toISOString().split("T")[0];
}

// Helper: get Sunday after a given date string
function sundayAfter(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const airport = searchParams.get("airport");
  const departDate = searchParams.get("depart") || nextFriday();
  const returnDate = searchParams.get("return") || sundayAfter(departDate);

  if (!airport) {
    return NextResponse.json({ ok: false, error: "airport param required" }, { status: 400 });
  }

  const cacheKey = `flights:LHR:${airport}:${departDate}:${returnDate}`;
  const historyKey = `flights_history:LHR:${airport}`;

  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });

    // ── Check cache first ──────────────────────────────────────────────────
    const cached = await redis.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json({ ok: true, ...cached, cached: true });
    }

    // ── Fetch from SerpApi ─────────────────────────────────────────────────
    if (!SERP_API_KEY) {
      return NextResponse.json({ ok: false, error: "SERP_API_KEY not set" }, { status: 500 });
    }

    const params = new URLSearchParams({
      engine: "google_flights",
      departure_id: "LHR",
      arrival_id: airport,
      outbound_date: departDate,
      return_date: returnDate,
      currency: "GBP",
      hl: "en",
      gl: "uk",
      type: "1", // round trip
      api_key: SERP_API_KEY,
    });

    const serpRes = await fetch(`https://serpapi.com/search?${params}`);
    if (!serpRes.ok) {
      throw new Error(`SerpApi error: ${serpRes.status}`);
    }
    const serpData = await serpRes.json();

    // ── Extract cheapest price ─────────────────────────────────────────────
    const allFlights = [
      ...(serpData.best_flights ?? []),
      ...(serpData.other_flights ?? []),
    ];

    if (allFlights.length === 0) {
      return NextResponse.json({ ok: false, error: "No flights found" });
    }

    const cheapest = allFlights.reduce((a: any, b: any) =>
      (a.price ?? Infinity) < (b.price ?? Infinity) ? a : b
    );

    const firstFlight = cheapest.flights?.[0];
    const result = {
      ok: true,
      price: cheapest.price,
      currency: "GBP",
      airline: firstFlight?.airline ?? null,
      airline_logo: firstFlight?.airline_logo ?? null,
      stops: cheapest.flights ? cheapest.flights.length - 1 : 0,
      duration_mins: cheapest.total_duration ?? null,
      depart_date: departDate,
      return_date: returnDate,
      price_level: serpData.price_insights?.price_level ?? null,
      fetched_at: new Date().toISOString(),
      cached: false,
    };

    // ── Store in Redis cache (6h TTL) ──────────────────────────────────────
    await redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });

    // ── Append to price history (keep last 20 entries per route) ──────────
    const history: any[] = (await redis.get<any[]>(historyKey)) ?? [];
    history.unshift({ price: result.price, fetched_at: result.fetched_at, depart_date: departDate, return_date: returnDate });
    if (history.length > 20) history.length = 20;
    await redis.set(historyKey, history);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("flights route error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
