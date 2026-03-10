"use client";
// app/resort/[id]/ResortDetail.tsx

import { useState, useCallback, useEffect } from "react";
import { Resort, ResortSnapshot, DayForecast } from "@/lib/resorts";
import { theme as t } from "@/lib/theme";

const FLAG: Record<string, string> = {
  CH: "🇨🇭", FR: "🇫🇷", AT: "🇦🇹", IT: "🇮🇹", NO: "🇳🇴", SE: "🇸🇪",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextFriday(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  return d.toISOString().split("T")[0];
}

function sundayAfter(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function priceLevelColor(level: string | null) {
  if (level === "low") return t.colors.priceLow;
  if (level === "high") return t.colors.priceHigh;
  return t.colors.priceTypical;
}

function formatDuration(mins: number | null) {
  if (!mins) return null;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ── Weather condition from temp + precip + snow ───────────────────────────────

function weatherCondition(day: DayForecast): { icon: string; label: string; color: string } {
  const { snowfall_cm, precip_prob, temp_max } = day;
  if (snowfall_cm >= 5) return { icon: "❄️", label: "Heavy snow", color: "#93c5fd" };
  if (snowfall_cm >= 1) return { icon: "🌨️", label: "Light snow", color: "#bfdbfe" };
  if (precip_prob >= 70) return { icon: "🌧️", label: "Rainy", color: "#94a3b8" };
  if (precip_prob >= 40) return { icon: "⛅", label: "Cloudy", color: "#cbd5e1" };
  if (temp_max >= 5 && precip_prob < 30) return { icon: "☀️", label: "Sunny", color: "#fde68a" };
  if (temp_max >= 0 && precip_prob < 30) return { icon: "🌤️", label: "Mostly sunny", color: "#fef08a" };
  return { icon: "🌥️", label: "Overcast", color: "#94a3b8" };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 15, color: i <= Math.round(score) ? t.colors.accentYellow : t.colors.borderSubtle }}>★</span>
      ))}
      <span style={{ fontSize: 13, color: t.colors.textMuted, marginLeft: 4 }}>{score}</span>
    </div>
  );
}

// ── 7-day forecast card ───────────────────────────────────────────────────────

function ForecastDay({ day, isFirst }: { day: DayForecast; isFirst: boolean }) {
  const cond = weatherCondition(day);
  const isSunny = cond.label.includes("sunny") || cond.label === "Sunny";

  return (
    <div style={{
      background: isSunny ? "#1a1a00" : t.colors.cardBg,
      border: `1px solid ${isSunny ? "#3a3a00" : t.colors.borderSubtle}`,
      borderRadius: t.card.statRadius,
      padding: 14,
      display: "flex", flexDirection: "column", gap: 8,
      minWidth: 130,
      flex: 1,
      position: "relative",
      overflow: "hidden",
    }}>
      {isSunny && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
        }} />
      )}
      <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, fontFamily: t.fonts.mono }}>
        {formatDay(day.date)}
      </div>
      <div style={{ fontSize: 28, lineHeight: 1 }}>{cond.icon}</div>
      <div style={{ fontSize: t.fontSize.subtext, color: cond.color, fontWeight: 600 }}>{cond.label}</div>

      {/* Temps */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: t.fontSize.detailValue, fontWeight: 700, color: temp_color(day.temp_max), fontFamily: t.fonts.mono }}>
          {day.temp_max > 0 ? "+" : ""}{day.temp_max}°
        </span>
        <span style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, fontFamily: t.fonts.mono }}>
          / {day.temp_min > 0 ? "+" : ""}{day.temp_min}°
        </span>
      </div>

      {/* Snow */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>SNOWFALL</span>
          <span style={{ fontSize: t.fontSize.sectionLabel, fontWeight: 700, color: day.snowfall_cm > 0 ? t.colors.accentBlue : t.colors.textFaint, fontFamily: t.fonts.mono }}>
            {day.snowfall_cm} cm
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>DEPTH</span>
          <span style={{ fontSize: t.fontSize.sectionLabel, fontWeight: 700, color: t.colors.textSecondary, fontFamily: t.fonts.mono }}>
            {day.snow_depth_cm} cm
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>PRECIP</span>
          <span style={{ fontSize: t.fontSize.sectionLabel, fontWeight: 700, color: day.precip_prob >= 60 ? t.colors.accentPurple : t.colors.textFaint, fontFamily: t.fonts.mono }}>
            {day.precip_prob}%
          </span>
        </div>
      </div>
    </div>
  );
}

function temp_color(temp: number): string {
  if (temp >= 8) return "#fb923c";
  if (temp >= 2) return "#fbbf24";
  if (temp >= -5) return "#93c5fd";
  return "#818cf8";
}

// ── Airport flight row ────────────────────────────────────────────────────────

function AirportFlightRow({
  airportCode, airportName, distanceKm, departDate, returnDate, flightData, loading,
  londonCode,
}: {
  airportCode: string; airportName: string; distanceKm: number;
  departDate: string; returnDate: string;
  flightData: any; loading: boolean;
  londonCode: string;
}) {
  const skyscannerUrl = `https://www.skyscanner.net/transport/flights/${londonCode.toLowerCase()}/${airportCode.toLowerCase()}/${departDate.replace(/-/g,"").slice(2)}/${returnDate.replace(/-/g,"").slice(2)}/?adults=1&currency=GBP`;

  return (
    <div style={{
      background: t.colors.flightBg,
      border: `1px solid ${t.colors.flightBorder}`,
      borderRadius: t.card.statRadius,
      padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
    }}>
      {/* Route pill: LTN → GVA */}
      <div style={{ minWidth: 160 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: t.colors.accentBlue ?? "#60a5fa", fontFamily: t.fonts.mono,
            background: "rgba(96,165,250,0.12)", borderRadius: 4, padding: "2px 6px" }}>{londonCode}</span>
          <span style={{ fontSize: 12, color: t.colors.textMuted }}>→</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: t.colors.textPrimary, fontFamily: t.fonts.mono,
            background: t.colors.statBg, borderRadius: 4, padding: "2px 6px" }}>{airportCode}</span>
        </div>
        <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textSecondary, marginTop: 4 }}>
          {airportName} · {distanceKm} km
        </div>
      </div>

      {/* Price */}
      <div style={{ flex: 1, minWidth: 120 }}>
        {loading ? (
          <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>Checking…</div>
        ) : flightData ? (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: t.fontSize.flightPrice, fontWeight: 800, fontFamily: t.fonts.mono, color: priceLevelColor(flightData.price_level) }}>
                £{flightData.price}
              </span>
              {flightData.price_level && (
                <span style={{ fontSize: t.fontSize.badge, color: priceLevelColor(flightData.price_level) }}>{flightData.price_level}</span>
              )}
            </div>
            <div style={{ fontSize: t.fontSize.flightSub, color: flightData.stops === 0 ? t.colors.textMuted : t.colors.accentRed ?? "#f87171" }}>
              {flightData.airline} · {flightData.stops === 0 ? "Direct" : `⚠ ${flightData.stops} stop — not direct`}
              {flightData.duration_mins ? ` · ${formatDuration(flightData.duration_mins)}` : ""}
            </div>
            <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textFaint }}>
              {flightData.cached ? "Cached · refresh to update" : "Live"}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>Price not loaded yet</div>
        )}
      </div>

      {/* Skyscanner link */}
      <a href={skyscannerUrl} target="_blank" rel="noopener noreferrer" style={{
        padding: "8px 14px", borderRadius: 8, border: `1px solid ${t.colors.borderActive}`,
        background: "transparent", color: t.colors.textSecondary,
        fontSize: t.fontSize.subtext, textDecoration: "none",
        whiteSpace: "nowrap",
      }}>
        Book ↗
      </a>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResortDetail({ resort, snapshot }: {
  resort: Resort; snapshot: ResortSnapshot | null;
}) {
  const [departDate, setDepartDate] = useState(nextFriday());
  const [returnDate, setReturnDate] = useState(() => sundayAfter(nextFriday()));
  const [flightData, setFlightData] = useState<Record<string, any>>({});
  const [flightsLoading, setFlightsLoading] = useState(false);

  // Summary state
  const [summary, setSummary] = useState<{ overview: string; news: string; sentiment: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryCached, setSummaryCached] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    setSummaryLoading(true);
    setSummaryError(null);
    fetch(`/api/resort-summary?id=${encodeURIComponent(resort.id)}&name=${encodeURIComponent(resort.name)}&country=${encodeURIComponent(resort.country)}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.sections) {
          setSummary(d.sections);
          setSummaryCached(d.cached ?? false);
        } else {
          setSummaryError(d.error ?? "Unknown error from API");
        }
      })
      .catch(e => setSummaryError(e.message))
      .finally(() => setSummaryLoading(false));
  }, [resort.id]);

  const allAirports = [resort.primary_airport, ...resort.alt_airports];

  // Build a flat list of {londonCode, destAirport} pairs where a direct flight exists,
  // sorted by destination airport distance_km (closest first)
  const LONDON_AIRPORTS = ["LTN", "LHR", "LGW", "STN"] as const;
  type LondonCode = typeof LONDON_AIRPORTS[number];

  type FlightRow = { londonCode: LondonCode; destCode: string; destName: string; distanceKm: number; flightKey: string };

  const flightRows: FlightRow[] = [];
  for (const ap of allAirports) {
    const mins = ap.flight_mins as Record<LondonCode, number | null>;
    for (const lon of LONDON_AIRPORTS) {
      if (mins[lon] !== null && mins[lon] !== undefined) {
        flightRows.push({
          londonCode: lon,
          destCode: ap.code,
          destName: ap.name,
          distanceKm: ap.distance_km,
          flightKey: `${lon}:${ap.code}`,
        });
      }
    }
  }
  // Sort by destination distance (closest airport first), then by London airport priority
  flightRows.sort((a, b) => a.distanceKm - b.distanceKm || LONDON_AIRPORTS.indexOf(a.londonCode) - LONDON_AIRPORTS.indexOf(b.londonCode));
  const allDays = snapshot
    ? [...snapshot.forecast.next_3_days, ...snapshot.forecast.following_4_days]
    : [];

  // Update return date when depart changes
  useEffect(() => {
    const d = new Date(departDate);
    d.setDate(d.getDate() + 2);
    setReturnDate(d.toISOString().split("T")[0]);
  }, [departDate]);

  // Load cached flight prices from session on mount / date change
  useEffect(() => {
    const cached: Record<string, any> = {};
    for (const row of flightRows) {
      const key = `flight:${row.flightKey}:${departDate}:${returnDate}`;
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) cached[row.flightKey] = JSON.parse(stored);
      } catch {}
    }
    setFlightData(cached);
  }, [departDate, returnDate]);

  const fetchAllFlights = useCallback(async () => {
    setFlightsLoading(true);
    const results: Record<string, any> = {};
    for (const row of flightRows) {
      try {
        const res = await fetch(`/api/flights?airport=${row.destCode}&depart=${departDate}&return=${returnDate}&from=${row.londonCode}`);
        const json = await res.json();
        if (json.ok) {
          results[row.flightKey] = json;
          try { sessionStorage.setItem(`flight:${row.flightKey}:${departDate}:${returnDate}`, JSON.stringify(json)); } catch {}
        }
      } catch {}
      // Small delay between requests
      await new Promise(r => setTimeout(r, 300));
    }
    setFlightData(results);
    setFlightsLoading(false);
  }, [departDate, returnDate]);

  const liftsPercent = snapshot ? Math.round((snapshot.lifts.open / snapshot.lifts.total) * 100) : 0;
  const cheapestSchool = resort.ski_schools.reduce((a, b) => a.price_per_hour < b.price_per_hour ? a : b);

  return (
    <div style={{ minHeight: "100vh", background: t.colors.pageBg, paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: t.colors.headerBg, borderBottom: `1px solid ${t.colors.borderSubtle}`, padding: "20px 32px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/" style={{ color: t.colors.textMuted, textDecoration: "none", fontSize: t.fontSize.subtext, display: "flex", alignItems: "center", gap: 4 }}>
              ← Back
            </a>
            <span style={{ color: t.colors.borderSubtle }}>|</span>
            <span style={{ fontSize: 24 }}>{FLAG[resort.country]}</span>
            <h1 style={{ margin: 0, fontSize: t.fontSize.appTitle, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.heading }}>
              {resort.name}
            </h1>
          </div>
          <StarRating score={resort.composite_rating} />
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* AI Summary */}
        <div style={{
          background: t.colors.cardBg,
          border: `1px solid ${t.colors.borderSubtle}`,
          borderRadius: 16,
          padding: "20px 24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
              ✦ Resort Intelligence
            </h2>
            {!summaryLoading && (
              <span style={{ fontSize: 10, color: t.colors.textFaint }}>
                {summaryCached ? "Cached · updated daily" : "Live · just fetched"}
              </span>
            )}
          </div>

          {summaryLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["60%","90%","75%","85%","50%"].map((w, i) => (
                <div key={i} style={{
                  height: 12, borderRadius: 6, width: w,
                  background: t.colors.statBg,
                  opacity: 0.6,
                }} />
              ))}
              <div style={{ fontSize: 11, color: t.colors.textFaint, marginTop: 4 }}>Researching resort…</div>
            </div>
          ) : summary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {([
                { label: "🏔 Overview", key: "overview" as const, color: t.colors.accentBlue },
                { label: "📰 News & Developments", key: "news" as const, color: t.colors.accentYellow },
                { label: "💬 Skier Sentiment", key: "sentiment" as const, color: t.colors.accentGreen },
              ] as const).map(({ label, key, color }) => summary[key] ? (
                <div key={key}>
                  <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: t.colors.textSecondary, lineHeight: 1.7 }}>
                    {summary[key]}
                  </div>
                </div>
              ) : null)}
            </div>
          ) : summaryError ? (
            <div style={{ fontSize: 13, color: t.colors.accentRed ?? "#f87171" }}>
              ⚠ {summaryError}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: t.colors.textMuted }}>
              Summary unavailable — try refreshing the page.
            </div>
          )}
        </div>

        {/* No data warning */}
        {!snapshot && (
          <div style={{ background: "#1c1400", border: "1px solid #3f2d00", borderRadius: 12, padding: "13px 18px", color: t.colors.accentYellow, fontSize: t.fontSize.subtext }}>
            ⚠️ No forecast data yet — go back and hit Refresh first.
          </div>
        )}

        {/* Stats row */}
        {snapshot && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "7-DAY SNOW", value: `${snapshot.forecast.total_7day_snow_cm} cm`, color: t.colors.accentBlue },
              { label: "LIFTS OPEN", value: `${snapshot.lifts.open} / ${snapshot.lifts.total}`, sub: `${liftsPercent}%`, color: t.colors.accentGreen },
              { label: "SNOW DEPTH", value: `${allDays[0]?.snow_depth_cm ?? "—"} cm`, color: t.colors.textPrimary },
              { label: "TOTAL LIFTS", value: resort.total_lifts.toString(), color: t.colors.textPrimary },
              { label: "1-DAY PASS", value: resort.ski_pass ? `${resort.ski_pass.day_1} ${resort.ski_pass.currency}` : "—", color: t.colors.accentGreen },
              { label: "3-DAY PASS", value: resort.ski_pass ? `${resort.ski_pass.day_3} ${resort.ski_pass.currency}` : "—", color: t.colors.accentGreen },
              { label: "6-DAY PASS", value: resort.ski_pass ? `${resort.ski_pass.day_6} ${resort.ski_pass.currency}` : "—", color: t.colors.accentGreen },
              { label: "CHEAPEST SCHOOL", value: `${cheapestSchool.price_per_hour} ${cheapestSchool.currency}`, sub: "per hour", color: t.colors.accentYellow },
            ].map(s => (
              <div key={s.label} style={{ background: t.colors.statBg, borderRadius: t.card.statRadius, padding: 14 }}>
                <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: t.fontSize.detailValue, fontWeight: 800, color: s.color, fontFamily: t.fonts.mono }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textMuted, marginTop: 2 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {/* 7-day forecast */}
        {snapshot && (
          <div>
            <h2 style={{ margin: "0 0 14px", fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
              7-Day Forecast
            </h2>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {allDays.map((day, i) => (
                <ForecastDay key={day.date} day={day} isFirst={i === 0} />
              ))}
            </div>
          </div>
        )}

        {/* Ski schools */}
        <div>
          <h2 style={{ margin: "0 0 14px", fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
            🎿 Ski Schools
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resort.ski_schools.map((school, i) => (
              <div key={school.name} style={{
                background: t.colors.cardBg,
                border: `1px solid ${i === 0 ? t.colors.accentYellow + "44" : t.colors.borderSubtle}`,
                borderRadius: t.card.statRadius, padding: 14,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: t.fontSize.detailSection, fontWeight: 600, color: t.colors.textPrimary }}>
                    {i === 0 && <span style={{ fontSize: 10, background: "#2a1e00", color: t.colors.accentYellow, padding: "2px 6px", borderRadius: 4, marginRight: 8 }}>CHEAPEST</span>}
                    {school.name}
                  </div>
                </div>
                <div style={{ fontSize: t.fontSize.detailValue, fontWeight: 800, color: t.colors.accentYellow, fontFamily: t.fonts.mono }}>
                  {school.price_per_hour} <span style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, fontWeight: 400 }}>{school.currency}/hr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flights section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
                ✈ Flights from London
              </h2>
              <div style={{ fontSize: 11, color: t.colors.textMuted, marginTop: 3 }}>
                All direct routes · LTN / LHR / LGW / STN
              </div>
            </div>

            {/* Date pickers + fetch all button */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>
                <span>Depart</span>
                <input
                  type="date" value={departDate}
                  onChange={e => setDepartDate(e.target.value)}
                  style={{ background: t.colors.cardBg, border: `1px solid ${t.colors.borderActive}`, borderRadius: 8, padding: "5px 8px", color: t.colors.textPrimary, fontSize: t.fontSize.subtext, fontFamily: t.fonts.body }}
                />
                <span>Return</span>
                <input
                  type="date" value={returnDate} min={departDate}
                  onChange={e => setReturnDate(e.target.value)}
                  style={{ background: t.colors.cardBg, border: `1px solid ${t.colors.borderActive}`, borderRadius: 8, padding: "5px 8px", color: t.colors.textPrimary, fontSize: t.fontSize.subtext, fontFamily: t.fonts.body }}
                />
              </div>
              <button
                onClick={fetchAllFlights}
                disabled={flightsLoading}
                style={{
                  padding: "8px 18px", borderRadius: 8, border: "none",
                  background: flightsLoading ? t.colors.flightBtnLoading : t.colors.flightBtn,
                  color: flightsLoading ? t.colors.textMuted : "#fff",
                  fontSize: t.fontSize.subtext, fontWeight: 600,
                  cursor: flightsLoading ? "wait" : "pointer", fontFamily: t.fonts.body,
                  whiteSpace: "nowrap",
                }}
              >
                {flightsLoading ? "⟳ Checking all…" : "✈ Get Flight Prices"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {flightRows.length === 0 ? (
              <div style={{ color: t.colors.textMuted, fontSize: t.fontSize.subtext, padding: "12px 0" }}>
                No direct flights from London airports to this resort.
              </div>
            ) : flightRows.map(row => (
              <AirportFlightRow
                key={row.flightKey}
                airportCode={row.destCode}
                airportName={row.destName}
                distanceKm={row.distanceKm}
                londonCode={row.londonCode}
                departDate={departDate}
                returnDate={returnDate}
                flightData={flightData[row.flightKey] ?? null}
                loading={flightsLoading}
              />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textFaint, paddingTop: 10, borderTop: `1px solid ${t.colors.borderSubtle}` }}>
          Forecast data: Open-Meteo · Flight prices: Google Flights via SerpApi · Prices cached 6hrs
        </div>
      </div>
    </div>
  );
}
