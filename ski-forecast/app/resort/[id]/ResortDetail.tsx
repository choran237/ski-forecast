"use client";
// app/resort/[id]/ResortDetail.tsx

import { useState, useCallback, useEffect } from "react";
import { Resort, ResortSnapshot, DayForecast, SkiPassPrices, SnowData } from "@/lib/resorts";
import { Currency, CURRENCY_OPTIONS, formatPrice } from "@/lib/currency";
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
  airportCode, airportName, distanceKm, transitHours, departDate, returnDate, flightData, loading,
}: {
  airportCode: string; airportName: string; distanceKm: number; transitHours: number;
  departDate: string; returnDate: string;
  flightData: any; loading: boolean;
}) {
  const skyscannerUrl = `https://www.skyscanner.net/transport/flights/lhr/${airportCode.toLowerCase()}/${departDate.replace(/-/g,"").slice(2)}/${returnDate.replace(/-/g,"").slice(2)}/?adults=1&currency=GBP`;

  return (
    <div style={{
      background: t.colors.flightBg,
      border: `1px solid ${t.colors.flightBorder}`,
      borderRadius: t.card.statRadius,
      padding: 14,
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
    }}>
      {/* Airport info */}
      <div style={{ minWidth: 120 }}>
        <div style={{ fontSize: t.fontSize.detailValue, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.mono }}>
          {airportCode}
        </div>
        <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textSecondary }}>{airportName}</div>
        <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textMuted }}>{distanceKm} km away</div>
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
            <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textMuted }}>
              {flightData.airline} · {flightData.stops === 0 ? "Direct" : `${flightData.stops} stop`}
              {flightData.duration_mins ? ` · ${formatDuration(flightData.duration_mins)}` : ""}
            </div>
            <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textFaint }}>
              LHR → {airportCode} · {flightData.cached ? "Cached" : "Live"}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>LHR → {airportCode} · price not loaded</div>
        )}
      </div>

      {/* Skyscanner link */}
      <a href={skyscannerUrl} target="_blank" rel="noopener noreferrer" style={{
        padding: "8px 14px", borderRadius: 8, border: `1px solid ${t.colors.borderActive}`,
        background: "transparent", color: t.colors.textSecondary,
        fontSize: t.fontSize.subtext, textDecoration: "none",
        whiteSpace: "nowrap",
      }}>
        Book on Skyscanner ↗
      </a>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResortDetail({ resort, snapshot }: {
  resort: Resort; snapshot: ResortSnapshot | null;
}) {
  const [departDate, setDepartDate] = useState(nextFriday());
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("GBP");
  const [returnDate, setReturnDate] = useState(() => sundayAfter(nextFriday()));
  const [flightData, setFlightData] = useState<Record<string, any>>({});
  const [flightsLoading, setFlightsLoading] = useState(false);

  const allAirports = [resort.primary_airport, ...resort.alt_airports];
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
    for (const ap of allAirports) {
      const key = `flight:${ap.code}:${departDate}:${returnDate}`;
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) cached[ap.code] = JSON.parse(stored);
      } catch {}
    }
    setFlightData(cached);
  }, [departDate, returnDate]);

  const fetchAllFlights = useCallback(async () => {
    setFlightsLoading(true);
    const results: Record<string, any> = {};
    for (const ap of allAirports) {
      try {
        const res = await fetch(`/api/flights?airport=${ap.code}&depart=${departDate}&return=${returnDate}`);
        const json = await res.json();
        if (json.ok) {
          results[ap.code] = json;
          try { sessionStorage.setItem(`flight:${ap.code}:${departDate}:${returnDate}`, JSON.stringify(json)); } catch {}
        }
      } catch {}
      // Small delay between airport requests
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
              { label: "TOTAL LIFTS", value: resort.total_lifts.toString(), color: t.colors.textPrimary },
              { label: "TOTAL RUNS", value: resort.total_runs.toString(), color: t.colors.textPrimary },
              { label: "KM OF RUNS", value: `${resort.km_of_runs} km`, color: t.colors.accentPurple },
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

        {/* Snow depth analysis */}
        {snapshot && resort.snow_data && (() => {
          const current7day = parseFloat(snapshot.forecast.total_7day_snow_cm);
          const avg = resort.snow_data.avg_seasonal_cm;
          const pctOfAvg = avg > 0 ? Math.round((current7day / avg) * 100) : 0;
          const depthNow = allDays[0]?.snow_depth_cm ?? 0;
          return (
            <div>
              <h2 style={{ margin: "0 0 14px", fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
                ❄️ Snow Conditions
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {[
                  { label: "BASE DEPTH NOW", value: `${depthNow} cm`, color: t.colors.accentBlue, sub: `typical base: ${resort.snow_data.base_depth_cm}cm` },
                  { label: "SUMMIT DEPTH", value: `${resort.snow_data.summit_depth_cm} cm`, color: t.colors.textPrimary, sub: "typical maximum" },
                  { label: "7-DAY SNOW", value: `${snapshot.forecast.total_7day_snow_cm} cm`, color: t.colors.accentBlue, sub: "forecast total" },
                  { label: "VS SEASONAL AVG", value: `${pctOfAvg}%`, color: pctOfAvg >= 100 ? t.colors.accentGreen : pctOfAvg >= 70 ? t.colors.accentYellow : t.colors.accentRed, sub: `avg: ${avg}cm/season` },
                ].map(s => (
                  <div key={s.label} style={{ background: t.colors.statBg, borderRadius: t.card.statRadius, padding: 14 }}>
                    <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: t.fontSize.detailValue, fontWeight: 800, color: s.color, fontFamily: t.fonts.mono }}>{s.value}</div>
                    <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textMuted, marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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
                  {formatPrice(school.price_per_hour, school.currency, displayCurrency)}<span style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, fontWeight: 400 }}>/hr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ski pass prices */}
        {resort.ski_pass && (
          <div>
            <h2 style={{ margin: "0 0 14px", fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
              🎫 Ski Pass Prices
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {[
                { label: "1 Day", value: resort.ski_pass.day_1 },
                { label: "3 Days", value: resort.ski_pass.day_3, highlight: true },
                { label: "6 Days", value: resort.ski_pass.day_6 },
                { label: "Season", value: resort.ski_pass.season },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{
                  background: highlight ? "#0a1a10" : t.colors.cardBg,
                  border: `1px solid ${highlight ? t.colors.accentGreen + "55" : t.colors.borderSubtle}`,
                  borderRadius: t.card.statRadius, padding: 14, textAlign: "center",
                }}>
                  <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8, marginBottom: 6 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: t.fontSize.flightPrice, fontWeight: 800, color: highlight ? t.colors.accentGreen : t.colors.textPrimary, fontFamily: t.fonts.mono }}>
                    {formatPrice(value, resort.ski_pass.currency, displayCurrency)}
                  </div>
                  {highlight && <div style={{ fontSize: 10, color: t.colors.accentGreen, marginTop: 4 }}>most popular</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flights section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
              ✈ Flights from London (LHR)
            </h2>

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
              <select
                value={displayCurrency}
                onChange={e => setDisplayCurrency(e.target.value as Currency)}
                style={{ background: t.colors.cardBg, border: `1px solid ${t.colors.borderActive}`, borderRadius: 8, padding: "5px 10px", color: t.colors.textSecondary, fontSize: t.fontSize.subtext, fontFamily: t.fonts.body, cursor: "pointer" }}
              >
                {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
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
            {allAirports.map(ap => (
              <AirportFlightRow
                key={ap.code}
                airportCode={ap.code}
                airportName={ap.name}
                distanceKm={ap.distance_km}
                transitHours={ap.transit_hours}
                departDate={departDate}
                returnDate={returnDate}
                flightData={flightData[ap.code] ?? null}
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
