// app/api/favourites/route.ts
// Stores favourite resort IDs in Redis
// GET  → returns array of favourite resort IDs
// POST → { id, action: "add"|"remove" } → updates and returns new list

import { NextRequest, NextResponse } from "next/server";

const FAVS_KEY = "favourites";

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function GET() {
  try {
    const redis = await getRedis();
    const favs = (await redis.get<string[]>(FAVS_KEY)) ?? [];
    return NextResponse.json({ ok: true, favourites: favs });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ ok: false, error: "id and action required" }, { status: 400 });
    }

    const redis = await getRedis();
    let favs = (await redis.get<string[]>(FAVS_KEY)) ?? [];

    if (action === "add" && !favs.includes(id)) {
      favs = [...favs, id];
    } else if (action === "remove") {
      favs = favs.filter((f) => f !== id);
    }

    await redis.set(FAVS_KEY, favs);
    return NextResponse.json({ ok: true, favourites: favs });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
