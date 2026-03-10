// app/api/resort-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resortId = searchParams.get("id");
  const resortName = searchParams.get("name");
  const country = searchParams.get("country");

  if (!resortId || !resortName) {
    return NextResponse.json({ ok: false, error: "Missing params" }, { status: 400 });
  }

  const cacheKey = `resort-summary:${resortId}`;

  // Check Redis cache first
  try {
    const cached = await redis.get<any>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  } catch {}

  // Call Claude API with web search
  try {
    const prompt = `You are a ski resort expert. Research "${resortName}" (${country}) ski resort and provide a concise summary covering three areas:

1. OVERVIEW: The resort's character, terrain, who it suits best, what makes it special or unique. 2-3 sentences max.

2. NEWS & DEVELOPMENTS: Any recent news from the last 1-2 seasons — new lifts, infrastructure projects, expansion plans, notable events, competitions, or changes. If nothing notable, say so briefly.

3. SKIER SENTIMENT: What recent reviews and skier feedback say — what people love, any common complaints, how it compares to similar resorts. 2-3 sentences.

Use web search to find current information. Be specific and factual — mention actual lift names, project names, dates where known. Keep the whole response concise and scannable. Do not use markdown headers or bullet points — write in short punchy paragraphs separated by the section labels OVERVIEW:, NEWS:, SENTIMENT: on their own lines.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "interleaved-thinking-2025-05-14",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract text from response (may include tool_use blocks)
    const text = data.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n")
      .trim();

    // Parse into sections
    const sections = parseSections(text);

    const result = {
      ok: true,
      resort_id: resortId,
      generated_at: new Date().toISOString(),
      raw: text,
      sections,
    };

    // Cache for 24 hours
    try {
      await redis.set(cacheKey, result, { ex: CACHE_TTL });
    } catch {}

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

function parseSections(text: string): { overview: string; news: string; sentiment: string } {
  const overview = extractSection(text, "OVERVIEW");
  const news = extractSection(text, "NEWS");
  const sentiment = extractSection(text, "SENTIMENT");
  return { overview, news, sentiment };
}

function extractSection(text: string, label: string): string {
  const regex = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n(?:OVERVIEW|NEWS|SENTIMENT):|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}
