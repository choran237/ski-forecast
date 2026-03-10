"use client";
// app/components/Dashboard.tsx

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ForecastRun, ResortSnapshot, getBestDeparture, LONDON_AIRPORT_PRIORITY, LondonAirport } from "@/lib/resorts";
import { RESORTS } from "@/lib/resorts";
import { theme as t } from "@/lib/theme";
import { Currency, CURRENCY_OPTIONS, formatPrice } from "@/lib/currency";

const MAX_HISTORY = 6;

const FLAG: Record<string, string> = {
  CH: "🇨🇭", FR: "🇫🇷", AT: "🇦🇹", IT: "🇮🇹", NO: "🇳🇴", SE: "🇸🇪",
};

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

function priceLevelColor(level: string | null) {
  if (level === "low") return t.colors.priceLow;
  if (level === "high") return t.colors.priceHigh;
  return t.colors.priceTypical;
}

function formatDuration(mins: number | null) {
  if (!mins) return null;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 13, color: i <= Math.round(score) ? t.colors.accentYellow : t.colors.borderSubtle }}>★</span>
      ))}
      <span style={{ fontSize: t.fontSize.badge, color: t.colors.textMuted, marginLeft: 4 }}>{score}</span>
    </div>
  );
}

function FavStar({ isFav, onToggle }: { isFav: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={isFav ? "Remove from favourites" : "Add to favourites"}
      style={{
        background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
        fontSize: 18, color: isFav ? t.colors.favActive : t.colors.favInactive,
        lineHeight: 1, transition: "color 0.2s",
      }}
    >★</button>
  );
}

function SnowBar({ days, color }: { days: any[]; color: string }) {
  const max = Math.max(...days.map(d => d.snowfall_cm), 1);
  return (
    <div style={{ display: "flex", gap: t.bars.gap, alignItems: "flex-end", height: t.bars.height }}>
      {days.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: "100%", borderRadius: t.bars.radius,
            height: Math.max(t.bars.minBarHeight, (d.snowfall_cm / max) * t.bars.maxBarHeight),
            background: color, opacity: 0.9, transition: "height 0.5s ease",
          }} />
          <span style={{ fontSize: t.fontSize.barValue, color: t.colors.textSecondary, fontFamily: t.fonts.mono }}>
            {d.snowfall_cm.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Delta({ current, previous }: { current: string; previous?: string }) {
  if (!previous) return null;
  const diff = parseFloat(current) - parseFloat(previous);
  const abs = Math.abs(diff).toFixed(1);
  const zero = Math.abs(diff) < 0.1;
  return (
    <span style={{
      fontSize: t.fontSize.badge, marginLeft: 6, padding: "2px 8px", borderRadius: 99,
      background: zero ? t.colors.borderSubtle : diff > 0 ? "#052e16" : "#450a0a",
      color: zero ? t.colors.textMuted : diff > 0 ? t.colors.accentGreen : t.colors.accentRed,
      fontFamily: t.fonts.mono,
    }}>
      {zero ? "—" : `${diff > 0 ? "▲" : "▼"} ${abs} cm`}
    </span>
  );
}

function StatBox({ label, value, sub, barPct, barColor }: {
  label: string; value: React.ReactNode; sub: string; barPct?: number; barColor?: string;
}) {
  return (
    <div style={{ background: t.colors.statBg, borderRadius: t.card.statRadius, padding: t.card.statPadding }}>
      <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: t.fontSize.statValue, fontWeight: 700, fontFamily: t.fonts.mono, color: t.colors.textPrimary }}>{value}</div>
      <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, marginTop: 2 }}>{sub}</div>
      {barPct !== undefined && (
        <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: t.colors.borderSubtle }}>
          <div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>
      )}
    </div>
  );
}

function FlightBox({ routes, departDate, returnDate, onBestData, preferredDeparture }: {
  routes: { londonCode: string; destCode: string; destName: string; flightMins: number }[];
  departDate: string; returnDate: string;
  onBestData?: (d: any, londonCode: string, destCode: string) => void;
  preferredDeparture: string;
}) {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Load from sessionStorage on mount / date change
  useEffect(() => {
    const cached: Record<string, any> = {};
    for (const r of routes) {
      const key = `flight:${r.londonCode}:${r.destCode}:${departDate}:${returnDate}`;
      try {
        const s = sessionStorage.getItem(key);
        if (s) cached[`${r.londonCode}:${r.destCode}`] = JSON.parse(s);
      } catch {}
    }
    if (Object.keys(cached).length > 0) setPrices(cached);
  }, [departDate, returnDate, routes.map(r => r.londonCode + r.destCode).join(",")]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results: Record<string, any> = {};
    await Promise.all(routes.map(async (r) => {
      const key = `${r.londonCode}:${r.destCode}`;
      const cacheKey = `flight:${r.londonCode}:${r.destCode}:${departDate}:${returnDate}`;
      try {
        const res = await fetch(`/api/flights?airport=${r.destCode}&depart=${departDate}&return=${returnDate}&from=${r.londonCode}`);
        const json = await res.json();
        if (json.ok) {
          results[key] = json;
          try { sessionStorage.setItem(cacheKey, JSON.stringify(json)); } catch {}
        }
      } catch {}
    }));
    setPrices(results);
    setLoading(false);
  }, [routes, departDate, returnDate]);

  // Find best result: direct-only, prefer chosen departure airport, then cheapest direct
  const LONDON_PRIORITY = ["LTN", "LHR", "LGW", "STN"];
  const directPrices = Object.entries(prices).filter(([, data]) =>
    data?.price && data.stops === 0
  );
  // Sort: preferred departure first, then by price
  const sorted = [...directPrices].sort(([keyA, dataA], [keyB, dataB]) => {
    const lonA = keyA.split(":")[0];
    const lonB = keyB.split(":")[0];
    const prefA = lonA === preferredDeparture ? -1 : LONDON_PRIORITY.indexOf(lonA);
    const prefB = lonB === preferredDeparture ? -1 : LONDON_PRIORITY.indexOf(lonB);
    if (prefA !== prefB) return prefA - prefB;
    return (dataA.price ?? 999999) - (dataB.price ?? 999999);
  });
  const best = sorted.length > 0 ? { key: sorted[0][0], data: sorted[0][1] } : null;

  // Notify parent of best result for DOOR-DOOR calc
  useEffect(() => {
    if (best) {
      const [lon, dest] = best.key.split(":");
      onBestData?.(best.data, lon, dest);
    }
  }, [best?.key, best?.data?.price]);

  const bestRoute = best ? routes.find(r => `${r.londonCode}:${r.destCode}` === best.key) : null;
  const skyscannerUrl = best
    ? `https://www.skyscanner.net/transport/flights/${best.key.split(":")[0].toLowerCase()}/${best.key.split(":")[1].toLowerCase()}/${departDate.replace(/-/g,"").slice(2)}/${returnDate.replace(/-/g,"").slice(2)}/?adults=1&currency=GBP`
    : "#";

  // Before prices loaded: show preferred departure route as default
  const defaultRoute = routes.find(r => r.londonCode === preferredDeparture) ?? routes[0];

  return (
    <div style={{ background: t.colors.flightBg, border: `1px solid ${t.colors.flightBorder}`, borderRadius: t.card.statRadius, padding: t.card.statPadding }}>
      <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          ✈ FLIGHTS ·{" "}
          {best
            ? <span style={{ color: t.colors.accentBlue }}>{best.key.split(":")[0]}</span>
            : <span style={{ color: t.colors.accentBlue }}>{defaultRoute?.londonCode ?? "—"}</span>
          }
          {" → "}
          {best ? best.key.split(":")[1] : (defaultRoute?.destCode ?? "—")}
        </span>
        <span style={{ color: t.colors.textFaint, fontFamily: t.fonts.mono }}>
          {best ? formatDuration(best.data.duration_mins) : formatDuration(defaultRoute?.flightMins ?? null)}
        </span>
      </div>
      {best ? (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: t.fontSize.flightPrice, fontWeight: 800, fontFamily: t.fonts.mono, color: priceLevelColor(best.data.price_level) }}>
              £{best.data.price}
            </span>
            {best.data.price_level && (
              <span style={{ fontSize: t.fontSize.badge, color: priceLevelColor(best.data.price_level) }}>{best.data.price_level}</span>
            )}
          </div>
          <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textMuted }}>
            {best.data.airline} · {best.data.stops === 0 ? "Direct" : `${best.data.stops} stop`}
            {best.data.duration_mins ? ` · ${formatDuration(best.data.duration_mins)}` : ""}
          </div>
          <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textFaint }}>
            Direct · best of {routes.length} route{routes.length > 1 ? "s" : ""} · {best.data.cached ? "Cached" : "Live"}
          </div>
        </div>
      ) : loading ? (
        <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>Checking {routes.length} route{routes.length > 1 ? "s" : ""}…</div>
      ) : (
        <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>
          {routes.length} route{routes.length > 1 ? "s" : ""} available · press Refresh
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); fetchAll(); }} disabled={loading} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
          background: loading ? t.colors.flightBtnLoading : t.colors.flightBtn,
          color: loading ? t.colors.textMuted : "#fff",
          fontSize: t.fontSize.subtext, fontWeight: 600,
          cursor: loading ? "wait" : "pointer", fontFamily: t.fonts.body,
        }}>
          {loading ? "⟳ Checking…" : "⟳ Refresh"}
        </button>
        <a href={skyscannerUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
          padding: "8px 14px", borderRadius: 8, border: `1px solid ${t.colors.borderActive}`,
          background: "transparent", color: t.colors.textSecondary,
          fontSize: t.fontSize.subtext, textDecoration: "none",
        }}>Sky ↗</a>
      </div>
    </div>
  );
}


function ResortCard({ resort, prev, isFav, onToggleFav, departDate, returnDate, displayCurrency, preferredDeparture }: {
  resort: ResortSnapshot; prev?: ResortSnapshot;
  isFav: boolean; onToggleFav: () => void;
  departDate: string; returnDate: string; displayCurrency: string; preferredDeparture: LondonAirport;
}) {
  const { next_3_days, following_4_days, total_7day_snow_cm } = resort.forecast;
  const liftsPercent = Math.round((resort.lifts.open / resort.lifts.total) * 100);
  const resortMeta = RESORTS.find(r => r.id === resort.resort_id);
  const [flightData, setFlightData] = useState<any>(null);

  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/resort/${resort.resort_id}`)}
      style={{
        background: t.colors.cardBg,
        border: `1px solid ${isFav ? t.colors.accentYellow + "55" : t.colors.borderActive}`,
        borderRadius: t.card.borderRadius, padding: t.card.padding,
        display: "flex", flexDirection: "column", gap: t.card.gap,
        transition: "border-color 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 0 1px ${t.colors.accentBlue}44`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 20 }}>{FLAG[resort.country] ?? resort.country}</span>
            <h3 style={{ margin: 0, fontSize: t.fontSize.resortName, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.heading, letterSpacing: -0.3 }}>
              {resort.resort_name}
            </h3>
            <FavStar isFav={isFav} onToggle={onToggleFav} />
          </div>
          <StarRating score={resort.composite_rating} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: t.fontSize.snowTotal, fontWeight: 800, color: t.colors.accentBlue, fontFamily: t.fonts.mono, lineHeight: 1 }}>
            {total_7day_snow_cm}<span style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, fontWeight: 400 }}> cm</span>
          </div>
          <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, marginTop: 2 }}>7-day total</div>
          <Delta current={total_7day_snow_cm} previous={prev?.forecast.total_7day_snow_cm} />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", marginBottom: 6 }}>
          <div style={{ flex: 3, fontSize: t.fontSize.sectionLabel, color: t.colors.accentBlue, letterSpacing: 1, textTransform: "uppercase" }}>Next 3 days</div>
          <div style={{ flex: 4, fontSize: t.fontSize.sectionLabel, color: t.colors.accentPurple, letterSpacing: 1, textTransform: "uppercase", paddingLeft: 8 }}>Following 4 days</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 3 }}><SnowBar days={next_3_days} color={t.bars.colorNext3} /></div>
          <div style={{ width: 1, height: t.bars.height, background: t.colors.borderSubtle, flexShrink: 0 }} />
          <div style={{ flex: 4 }}><SnowBar days={following_4_days} color={t.bars.colorNext4} /></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        <StatBox
          label="Lifts Open"
          value={<span style={{ color: t.colors.accentGreen }}>{resort.lifts.open}</span>}
          sub={`of ${resort.lifts.total} (${liftsPercent}%)`}
          barPct={liftsPercent} barColor={t.colors.accentGreen}
        />
        <StatBox
          label="Km of Runs"
          value={<span style={{ color: t.colors.accentPurple }}>{resortMeta?.km_of_runs ?? "—"}</span>}
          sub={`${resortMeta?.total_runs ?? "—"} runs`}
        />
        <StatBox
          label="3-Day Pass"
          value={<span style={{ color: t.colors.accentGreen }}>{resortMeta?.ski_pass ? formatPrice(resortMeta.ski_pass.day_3, resortMeta.ski_pass.currency, displayCurrency) : "—"}</span>}
          sub="ski pass"
        />
        <StatBox
          label="Ski School"
          value={<span style={{ color: t.colors.accentYellow }}>{resortMeta?.ski_schools[0] ? formatPrice(resortMeta.ski_schools[0].price_per_hour, resortMeta.ski_schools[0].currency, displayCurrency) : "—"}</span>}
          sub="/hr cheapest"
        />
      </div>

      {resortMeta && (() => {
        const base = resortMeta.snow_data.base_depth_cm;
        const summit = resortMeta.snow_data.summit_depth_cm;
        const avg = resortMeta.snow_data.avg_seasonal_cm;
        const current7day = parseFloat(resort.forecast.total_7day_snow_cm);
        const pctOfAvg = avg > 0 ? Math.round((current7day / avg) * 100) : 0;
        const depthNow = next_3_days[0]?.snow_depth_cm ?? 0;
        const bestDep = getBestDeparture(resortMeta.primary_airport, preferredDeparture);
        const activeDeparture = bestDep?.code ?? "LHR";
        const transitHrs = resortMeta.primary_airport.transit_hours;
        const flightMins = flightData?.duration_mins ?? bestDep?.mins ?? 120;
        const totalHrs = ((flightMins / 60) + transitHrs).toFixed(1);
        const noDirectRoute = bestDep === null;
        return (
          <>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ background: t.colors.statBg, borderRadius: 8, padding: "7px 10px", flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: 9, color: t.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase" }}>BASE</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.mono }}>{depthNow}<span style={{ fontSize: 10, color: t.colors.textMuted }}>cm</span></div>
                <div style={{ fontSize: 9, color: t.colors.textFaint }}>live · {resortMeta.elevation_m}m</div>
              </div>
              <div style={{ background: t.colors.statBg, borderRadius: 8, padding: "7px 10px", flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: 9, color: t.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase" }}>SUMMIT</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.mono }}>{resort.summit_snow_depth_cm != null ? resort.summit_snow_depth_cm : "—"}<span style={{ fontSize: 10, color: t.colors.textMuted }}>cm</span></div>
                <div style={{ fontSize: 9, color: t.colors.textFaint }}>live · {resortMeta.summit_elevation_m}m</div>
              </div>
              <div style={{ background: t.colors.statBg, borderRadius: 8, padding: "7px 10px", flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: 9, color: t.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase" }}>DOOR-DOOR</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: parseFloat(totalHrs) <= 4 ? t.colors.accentGreen : parseFloat(totalHrs) <= 6 ? t.colors.accentYellow : t.colors.textPrimary, fontFamily: t.fonts.mono }}>
                  {totalHrs}<span style={{ fontSize: 10, color: t.colors.textMuted }}>h</span>
                </div>
                <div style={{ fontSize: 9, color: t.colors.textFaint }}>
                  {noDirectRoute ? "no direct route" : `${Math.floor(flightMins/60)}h${flightMins%60}m ✈ + ${transitHrs}h 🚗`}
                </div>
              </div>
            </div>
            <FlightBox
              routes={[resortMeta.primary_airport, ...resortMeta.alt_airports].flatMap(ap => {
                const fm = ap.flight_mins as Record<string, number | null>;
                return (["LTN","LHR","LGW","STN"] as const)
                  .filter(lon => fm[lon] != null)
                  .map(lon => ({ londonCode: lon, destCode: ap.code, destName: ap.name, flightMins: fm[lon]! }));
              })}
              departDate={departDate}
              returnDate={returnDate}
              onBestData={(d, lon, dest) => setFlightData(d)}
              preferredDeparture={preferredDeparture}
            />
          </>
        );
      })()}
    </div>
  );
}

function FavouritesStrip({ latest, favourites, onToggleFav }: {
  latest: ForecastRun; favourites: string[]; onToggleFav: (id: string) => void;
}) {
  const favResorts = latest.resorts.filter(r => favourites.includes(r.resort_id));
  if (favResorts.length === 0) return null;
  return (
    <div style={{ background: t.colors.favStripBg, border: `1px solid ${t.colors.favStripBorder}`, borderRadius: t.card.borderRadius, padding: "14px 18px" }}>
      <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.accentGreen, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>
        ★ Favourites
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
        {favResorts.map(r => (
          <div key={r.resort_id} style={{
            minWidth: t.favStrip.cardWidth, background: t.colors.cardBg,
            border: `1px solid ${t.colors.accentYellow}44`, borderRadius: t.favStrip.cardRadius,
            padding: t.favStrip.cardPadding, display: "flex", flexDirection: "column", gap: 4,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: t.fontSize.favStrip, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.heading }}>
                {FLAG[r.country]} {r.resort_name}
              </span>
              <FavStar isFav={true} onToggle={() => onToggleFav(r.resort_id)} />
            </div>
            <div style={{ fontSize: t.fontSize.snowTotal - 4, fontWeight: 800, color: t.colors.accentBlue, fontFamily: t.fonts.mono }}>
              {parseFloat(r.forecast.total_7day_snow_cm).toFixed(1)}<span style={{ fontSize: 10, color: t.colors.textMuted }}> cm</span>
            </div>
            <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textMuted }}>{r.lifts.open}/{r.lifts.total} lifts</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Top6Sort = "snow" | "rating" | "lifts";

function Top6Widget({ latest, favourites, sort, setSort, favsOnly, setFavsOnly }: {
  latest: ForecastRun; favourites: string[];
  sort: Top6Sort; setSort: (s: Top6Sort) => void;
  favsOnly: boolean; setFavsOnly: (v: boolean | ((b: boolean) => boolean)) => void;
}) {
  let resorts = favsOnly ? latest.resorts.filter(r => favourites.includes(r.resort_id)) : [...latest.resorts];
  resorts = resorts.sort((a, b) => {
    if (sort === "snow") return parseFloat(b.forecast.total_7day_snow_cm) - parseFloat(a.forecast.total_7day_snow_cm);
    if (sort === "rating") return b.composite_rating - a.composite_rating;
    return b.lifts.total - a.lifts.total;
  }).slice(0, 6);

  const SortBtn = ({ s, label }: { s: Top6Sort; label: string }) => (
    <button onClick={() => setSort(s)} style={{
      padding: "4px 10px", borderRadius: 8, border: "none",
      background: sort === s ? t.colors.tabActiveBg : "transparent",
      color: sort === s ? t.colors.tabActiveText : t.colors.tabInactiveText,
      fontSize: t.fontSize.tabLabel, cursor: "pointer", fontFamily: t.fonts.body,
    }}>{label}</button>
  );

  return (
    <div style={{ background: t.colors.top6Bg, border: `1px solid ${t.colors.borderSubtle}`, borderRadius: t.card.borderRadius, padding: t.card.padding }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>🏆 Top 6 Resorts</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <SortBtn s="snow" label="❄ Snow" />
          <SortBtn s="rating" label="★ Rating" />
          <SortBtn s="lifts" label="⛷ Lifts" />
          <button onClick={() => setFavsOnly((f: boolean) => !f)} style={{
            padding: "4px 10px", borderRadius: 8,
            border: `1px solid ${favsOnly ? t.colors.accentYellow : t.colors.borderSubtle}`,
            background: favsOnly ? "#2a1e00" : "transparent",
            color: favsOnly ? t.colors.accentYellow : t.colors.tabInactiveText,
            fontSize: t.fontSize.tabLabel, cursor: "pointer", fontFamily: t.fonts.body,
          }}>★ Favs only</button>

        </div>
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
        {resorts.map((r, i) => (
          <div key={r.resort_id} style={{
            minWidth: t.top6.cardWidth, background: t.colors.cardBg,
            border: `1px solid ${i === 0 ? t.colors.accentBlue + "55" : t.colors.borderSubtle}`,
            borderRadius: t.top6.cardRadius, padding: t.top6.cardPadding,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: t.top6.rankSize, fontWeight: 700, color: i === 0 ? t.colors.accentYellow : t.colors.textMuted, fontFamily: t.fonts.mono }}>#{i+1}</span>
              <span style={{ fontSize: 14 }}>{FLAG[r.country]}</span>
            </div>
            <div style={{ fontSize: t.fontSize.top6Title, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.heading, lineHeight: 1.2 }}>
              {r.resort_name}
            </div>
            <div style={{ fontSize: t.fontSize.top6Snow, fontWeight: 800, color: t.colors.accentBlue, fontFamily: t.fonts.mono }}>
              {parseFloat(r.forecast.total_7day_snow_cm).toFixed(1)}<span style={{ fontSize: 10, color: t.colors.textMuted }}> cm</span>
            </div>
            <div style={{ fontSize: t.fontSize.flightSub, color: t.colors.textMuted }}>★ {r.composite_rating} · {r.lifts.open}/{r.lifts.total} lifts</div>
          </div>
        ))}
        {resorts.length === 0 && (
          <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, padding: "10px 0" }}>No favourites yet</div>
        )}
      </div>
    </div>
  );
}

type TableSort = "snow" | "rating" | "lifts" | "depth";
type TableDir = "asc" | "desc";

function TableView({ latest, prev, favourites, onToggleFav, displayCurrency }: {
  latest: ForecastRun; prev?: ForecastRun; favourites: string[]; onToggleFav: (id: string) => void; displayCurrency: string;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<TableSort>("snow");
  const [dir, setDir] = useState<TableDir>("desc");

  const toggleSort = (col: TableSort) => {
    if (sort === col) setDir(d => d === "desc" ? "asc" : "desc");
    else { setSort(col); setDir("desc"); }
  };

  const sorted = [...latest.resorts].sort((a, b) => {
    let av = 0, bv = 0;
    if (sort === "snow") { av = parseFloat(a.forecast.total_7day_snow_cm); bv = parseFloat(b.forecast.total_7day_snow_cm); }
    if (sort === "rating") { av = a.composite_rating; bv = b.composite_rating; }
    if (sort === "lifts") { av = a.lifts.open; bv = b.lifts.open; }
    if (sort === "depth") { av = a.forecast.next_3_days[0]?.snow_depth_cm ?? 0; bv = b.forecast.next_3_days[0]?.snow_depth_cm ?? 0; }
    return dir === "desc" ? bv - av : av - bv;
  });

  const Th = ({ col, label }: { col: TableSort; label: string }) => (
    <th onClick={() => toggleSort(col)} style={{
      padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`,
      fontSize: t.fontSize.tableHeader, color: sort === col ? t.colors.accentBlue : t.colors.textMuted,
      letterSpacing: 0.8, textAlign: "left", textTransform: "uppercase",
      cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
      background: t.colors.tableHeaderBg,
    }}>
      {label} {sort === col ? (dir === "desc" ? "↓" : "↑") : ""}
    </th>
  );

  return (
    <div style={{ overflowX: "auto", borderRadius: t.table.borderRadius, border: `1px solid ${t.colors.borderSubtle}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: t.fonts.body }}>
        <thead>
          <tr>
            <th style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, fontSize: t.fontSize.tableHeader, color: t.colors.textMuted, textAlign: "left", background: t.colors.tableHeaderBg }}>Resort</th>
            <Th col="snow" label="7-day Snow" />
            <Th col="depth" label="Depth" />
            <Th col="rating" label="Rating" />
            <Th col="lifts" label="Lifts" />
            <th style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, fontSize: t.fontSize.tableHeader, color: t.colors.textMuted, textAlign: "left", background: t.colors.tableHeaderBg }}>Km Runs</th>
                  <th style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, fontSize: t.fontSize.tableHeader, color: t.colors.textMuted, textAlign: "left", background: t.colors.tableHeaderBg }}>Ski School (cheapest)</th>
            <th style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, fontSize: t.fontSize.tableHeader, color: t.colors.textMuted, textAlign: "left", background: t.colors.tableHeaderBg }}>Airport</th>
            <th style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, fontSize: t.fontSize.tableHeader, color: t.colors.textMuted, textAlign: "left", background: t.colors.tableHeaderBg }}>★</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const isFav = favourites.includes(r.resort_id);
            const depth = r.forecast.next_3_days[0]?.snow_depth_cm ?? "—";
            const liftsPercent = Math.round((r.lifts.open / r.lifts.total) * 100);
            const resortMeta = RESORTS.find(x => x.id === r.resort_id);
            const prevResort = prev?.resorts.find(x => x.resort_id === r.resort_id);
            const snowDiff = prevResort ? parseFloat(r.forecast.total_7day_snow_cm) - parseFloat(prevResort.forecast.total_7day_snow_cm) : null;
            return (
              <tr key={r.resort_id} onClick={() => router.push(`/resort/${r.resort_id}`)} style={{ background: i % 2 === 0 ? t.colors.tableBg : t.colors.historyRowBg, borderTop: `1px solid ${t.colors.borderSubtle}`, cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.background = t.colors.statBg)} onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? t.colors.tableBg : t.colors.historyRowBg)}>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: t.fontSize.tableCell, fontWeight: 600, color: t.colors.textPrimary, fontFamily: t.fonts.heading }}>{FLAG[r.country]} {r.resort_name}</span>
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: t.fontSize.tableCell, fontWeight: 700, color: t.colors.accentBlue, fontFamily: t.fonts.mono }}>{r.forecast.total_7day_snow_cm} cm</span>
                  {snowDiff !== null && Math.abs(snowDiff) >= 0.1 && (
                    <span style={{ fontSize: 10, marginLeft: 4, color: snowDiff > 0 ? t.colors.accentGreen : t.colors.accentRed }}>{snowDiff > 0 ? "▲" : "▼"}</span>
                  )}
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px` }}>
                  <span style={{ fontSize: t.fontSize.tableCell, color: t.colors.textSecondary, fontFamily: t.fonts.mono }}>{depth} cm</span>
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px` }}>
                  <span style={{ fontSize: t.fontSize.tableCell, color: t.colors.accentYellow, fontFamily: t.fonts.mono }}>★ {r.composite_rating}</span>
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: t.fontSize.tableCell, color: t.colors.accentGreen, fontFamily: t.fonts.mono }}>{r.lifts.open}/{r.lifts.total}</span>
                  <span style={{ fontSize: 10, color: t.colors.textMuted, marginLeft: 4 }}>({liftsPercent}%)</span>
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, whiteSpace: "nowrap" }}>
                  {resortMeta ? <span style={{ fontSize: t.fontSize.tableCell, color: t.colors.accentPurple, fontFamily: t.fonts.mono }}>{resortMeta.km_of_runs}km<span style={{ color: t.colors.textMuted, fontSize: 10 }}> / {resortMeta.total_runs}r</span></span> : "—"}
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, whiteSpace: "nowrap" }}>
                  {resortMeta ? (
                    <div>
                      <span style={{ fontSize: t.fontSize.tableCell, color: t.colors.accentYellow, fontFamily: t.fonts.mono }}>
                        {formatPrice(resortMeta.ski_schools[0].price_per_hour, resortMeta.ski_schools[0].currency, displayCurrency)}/hr
                      </span>
                      <div style={{ fontSize: 10, color: t.colors.textMuted }}>{resortMeta.ski_schools[0].name}</div>
                    </div>
                  ) : "—"}
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px`, whiteSpace: "nowrap" }}>
                  {resortMeta ? (
                    <div>
                      <span style={{ fontSize: t.fontSize.tableCell, color: t.colors.textSecondary }}>{resortMeta.primary_airport.code} · {resortMeta.primary_airport.distance_km}km</span>
                      <div style={{ fontSize: 10, color: t.colors.textMuted }}>🚗 {resortMeta.primary_airport.transit_hours}h transfer</div>
                    </div>
                  ) : "—"}
                </td>
                <td style={{ padding: `${t.table.cellPaddingV}px ${t.table.cellPaddingH}px` }}>
                  <FavStar isFav={isFav} onToggle={() => onToggleFav(r.resort_id)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HistoryPanel({ history }: { history: ForecastRun[] }) {
  if (history.length < 2) return null;
  return (
    <div style={{ background: t.colors.historyBg, border: `1px solid ${t.colors.borderSubtle}`, borderRadius: t.card.borderRadius, padding: t.card.padding }}>
      <h3 style={{ margin: "0 0 14px", fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
        Forecast History · {history.length} / {MAX_HISTORY} runs
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {history.map((run, i) => (
          <div key={run.fetched_at} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
            background: i === 0 ? t.colors.historyActiveBg : t.colors.historyRowBg,
            border: `1px solid ${i === 0 ? t.colors.borderActive : "transparent"}`,
          }}>
            <div style={{ fontSize: t.fontSize.historyTime, color: i === 0 ? t.colors.accentBlue : t.colors.textMuted, fontFamily: t.fonts.mono, minWidth: 150 }}>
              {i === 0 ? "▶ " : "  "}{new Date(run.fetched_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ display: "flex", gap: 20, flex: 1, flexWrap: "wrap" }}>
              {run.resorts.map(r => {
                const prevRun = history[i + 1];
                const prevResort = prevRun?.resorts.find(x => x.resort_id === r.resort_id);
                const diff = prevResort ? parseFloat(r.forecast.total_7day_snow_cm) - parseFloat(prevResort.forecast.total_7day_snow_cm) : null;
                return (
                  <div key={r.resort_id} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: t.fontSize.historyTime, fontWeight: 700, color: t.colors.textSecondary, fontFamily: t.fonts.mono }}>
                      {r.forecast.total_7day_snow_cm}<span style={{ fontSize: 9, color: t.colors.textMuted }}>cm</span>
                      {diff !== null && Math.abs(diff) >= 0.1 && (
                        <span style={{ fontSize: 10, marginLeft: 3, color: diff > 0 ? t.colors.accentGreen : t.colors.accentRed }}>{diff > 0 ? "▲" : "▼"}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: t.colors.textFaint }}>{r.resort_name.split(" ")[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ViewMode = "cards" | "table";

export default function Dashboard({ initialHistory }: { initialHistory: ForecastRun[] }) {
  const [history, setHistory] = useState<ForecastRun[]>(initialHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("cards");
  const [favourites, setFavourites] = useState<string[]>([]);
  const [top6Sort, setTop6Sort] = useState<Top6Sort>("snow");
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("GBP");
  const [top6FavsOnly, setTop6FavsOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minLifts, setMinLifts] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [minKmRuns, setMinKmRuns] = useState(0);
  const [maxTransitHours, setMaxTransitHours] = useState(0);
  const [maxFlightHours, setMaxFlightHours] = useState(0);
  const [preferredDeparture, setPreferredDeparture] = useState<LondonAirport>("LTN");
  const [departDate, setDepartDate] = useState(nextFriday());
  const [returnDate, setReturnDate] = useState(() => sundayAfter(nextFriday()));
  const [calendarTarget, setCalendarTarget] = useState<"depart"|"return"|null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });

  // On mount, always fetch fresh history so deltas are correct on first load
  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(d => { if (d.history?.length > 0) setHistory(d.history); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/favourites").then(r => r.json()).then(d => { if (d.ok) setFavourites(d.favourites); }).catch(() => {});
  }, []);

  useEffect(() => {
    const d = new Date(departDate);
    d.setDate(d.getDate() + 2);
    setReturnDate(d.toISOString().split("T")[0]);
  }, [departDate]);

  const toggleFav = useCallback(async (id: string) => {
    const action = favourites.includes(id) ? "remove" : "add";
    setFavourites(prev => action === "add" ? [...prev, id] : prev.filter(f => f !== id));
    try {
      await fetch("/api/favourites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    } catch {}
  }, [favourites]);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null); setNotice(null);
    try {
      const res = await fetch("/api/fetch-forecasts");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setHistory(json.history);
      if (!json.stored) setNotice("Forecasts checked — no changes since last run, history unchanged.");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const latest = history[0];
  const previous = history[1];

  const TabBtn = ({ v, label }: { v: ViewMode; label: string }) => (
    <button onClick={() => setView(v)} style={{
      padding: "7px 16px", borderRadius: 8, border: "none",
      background: view === v ? t.colors.tabActiveBg : "transparent",
      color: view === v ? t.colors.tabActiveText : t.colors.tabInactiveText,
      fontSize: t.fontSize.tabLabel, fontWeight: view === v ? 600 : 400,
      cursor: "pointer", fontFamily: t.fonts.body, transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: t.colors.pageBg, paddingBottom: 60 }} onClick={() => setCalendarTarget(null)}>
      <div style={{ background: t.colors.headerBg, borderBottom: `1px solid ${t.colors.borderSubtle}`, padding: "20px 32px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>⛷️</span>
              <div>
                <h1 style={{ margin: 0, fontSize: t.fontSize.appTitle, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.heading }}>London Powder Watch</h1>
                <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, marginTop: 2 }}>
                  {latest
                    ? <>Last run: <strong style={{ color: t.colors.textSecondary }}>{new Date(latest.fetched_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</strong> · {MAX_HISTORY - history.length} slots remaining</>
                    : "No data yet — hit Refresh to load forecasts"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.fontSize.subtext, color: t.colors.textMuted, position: "relative" }}>
                <span>✈ Depart</span>
                <button onClick={e => { e.stopPropagation(); const d = new Date(departDate); setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() }); setCalendarTarget(ct => ct === "depart" ? null : "depart"); }} style={{ background: t.colors.cardBg, border: `1px solid ${t.colors.borderActive}`, borderRadius: 8, padding: "5px 10px", color: t.colors.textPrimary, fontSize: t.fontSize.subtext, fontFamily: t.fonts.body, cursor: "pointer", minWidth: 100 }}>
                  📅 {departDate ? new Date(departDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Pick date"}
                </button>
                <span>Return</span>
                <button onClick={e => { e.stopPropagation(); const d = new Date(returnDate); setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() }); setCalendarTarget(ct => ct === "return" ? null : "return"); }} style={{ background: t.colors.cardBg, border: `1px solid ${t.colors.borderActive}`, borderRadius: 8, padding: "5px 10px", color: t.colors.textPrimary, fontSize: t.fontSize.subtext, fontFamily: t.fonts.body, cursor: "pointer", minWidth: 100 }}>
                  📅 {returnDate ? new Date(returnDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Pick date"}
                </button>
                {calendarTarget && (() => {
                  const { year, month } = calendarMonth;
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const blanks = (firstDay + 6) % 7;
                  const today = new Date(); today.setHours(0,0,0,0);
                  const selected = calendarTarget === "depart" ? departDate : returnDate;
                  const minDate = calendarTarget === "return" ? departDate : undefined;
                  const monthName = new Date(year, month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
                  const cells: (number|null)[] = [];
                  for (let i = 0; i < blanks; i++) cells.push(null);
                  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                  return (
                    <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "110%", left: 0, zIndex: 100, background: "#0d1f35", border: "1px solid #2a4060", borderRadius: 12, padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 280 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <button onClick={() => setCalendarMonth(m => { const d = new Date(m.year, m.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} style={{ background: "none", border: "none", color: "#7ba7cc", cursor: "pointer", fontSize: 16, padding: "2px 8px" }}>‹</button>
                        <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{monthName}</span>
                        <button onClick={() => setCalendarMonth(m => { const d = new Date(m.year, m.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} style={{ background: "none", border: "none", color: "#7ba7cc", cursor: "pointer", fontSize: 16, padding: "2px 8px" }}>›</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
                        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#4a6a8a", padding: "2px 0", fontWeight: 600 }}>{d}</div>)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                        {cells.map((day, i) => {
                          if (!day) return <div key={i} />;
                          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                          const cellDate = new Date(year, month, day);
                          const isPast = cellDate < today;
                          const isBeforeMin = minDate && dateStr < minDate;
                          const isSelected = dateStr === selected;
                          const isInRange = departDate && returnDate && dateStr > departDate && dateStr < returnDate;
                          const disabled = isPast || isBeforeMin;
                          return (
                            <button key={i} disabled={!!disabled} onClick={() => {
                              if (calendarTarget === "depart") { setDepartDate(dateStr); if (returnDate && dateStr >= returnDate) setReturnDate(""); }
                              else setReturnDate(dateStr);
                              setCalendarTarget(null);
                            }} style={{ padding: "6px 0", borderRadius: 6, border: "none", textAlign: "center", fontSize: 12, cursor: disabled ? "default" : "pointer", fontFamily: "inherit",
                              background: isSelected ? "#3b82f6" : isInRange ? "#1e3a5f" : "transparent",
                              color: disabled ? "#2a4060" : isSelected ? "#fff" : "#c8dff0",
                              fontWeight: isSelected ? 700 : 400,
                            }}>{day}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <select
                value={preferredDeparture}
                onChange={e => setPreferredDeparture(e.target.value as LondonAirport)}
                style={{ background: t.colors.cardBg, border: `1px solid ${t.colors.borderActive}`, borderRadius: 8, padding: "5px 10px", color: t.colors.textSecondary, fontSize: t.fontSize.subtext, fontFamily: t.fonts.body, cursor: "pointer" }}
              >
                <option value="LTN">✈ LTN</option>
                <option value="LHR">✈ LHR</option>
                <option value="LGW">✈ LGW</option>
                <option value="STN">✈ STN</option>
              </select>
                            <select
                value={displayCurrency}
                onChange={e => setDisplayCurrency(e.target.value as Currency)}
                style={{ background: t.colors.cardBg, border: `1px solid ${t.colors.borderActive}`, borderRadius: 8, padding: "5px 10px", color: t.colors.textSecondary, fontSize: t.fontSize.subtext, fontFamily: t.fonts.body, cursor: "pointer" }}
              >
                {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <a href="/api/export-csv" style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${t.colors.borderActive}`, background: "transparent", color: t.colors.textSecondary, fontSize: t.fontSize.subtext, textDecoration: "none", fontFamily: t.fonts.body, opacity: latest ? 1 : 0.4 }}>↓ CSV</a>
              <button onClick={refresh} disabled={loading} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: loading ? t.colors.refreshBtnDisabled : t.colors.refreshBtn, color: loading ? t.colors.textMuted : "#fff", fontSize: t.fontSize.subtext, fontWeight: 600, cursor: loading ? "wait" : "pointer", fontFamily: t.fonts.body }}>
                {loading ? "⟳ Fetching…" : "⟳ Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
        {notice && <div style={{ background: "#0c1a0c", border: "1px solid #1a3a1a", borderRadius: 12, padding: "13px 18px", color: t.colors.accentGreen, fontSize: t.fontSize.subtext }}>✓ {notice}</div>}
        {error && <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: "13px 18px", color: t.colors.accentRed, fontSize: t.fontSize.subtext }}>⚠️ {error}</div>}
        {history.length >= MAX_HISTORY && <div style={{ background: "#1c1400", border: "1px solid #3f2d00", borderRadius: 12, padding: "11px 18px", color: t.colors.accentYellow, fontSize: t.fontSize.subtext }}>📋 History full — next refresh will drop the oldest run.</div>}

        {latest ? (
          <>
            <FavouritesStrip latest={latest} favourites={favourites} onToggleFav={toggleFav} />
            <Top6Widget
              latest={latest} favourites={favourites}
              sort={top6Sort} setSort={setTop6Sort}
              favsOnly={top6FavsOnly} setFavsOnly={setTop6FavsOnly}
            />
            {/* Filter bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 6, background: t.colors.statBg, padding: 4, borderRadius: 10, border: `1px solid ${t.colors.borderSubtle}` }}>
                  <TabBtn v="cards" label="⊞ Cards" />
                  <TabBtn v="table" label="≡ Table" />
                </div>
                <button onClick={() => setShowFilters(f => !f)} style={{
                  padding: "6px 14px", borderRadius: 10, cursor: "pointer", fontFamily: t.fonts.body,
                  border: `1px solid ${(showFilters || minLifts > 0 || minRating > 0 || minKmRuns > 0 || maxTransitHours > 0 || maxFlightHours > 0) ? t.colors.accentBlue : t.colors.borderSubtle}`,
                  background: (showFilters || minLifts > 0 || minRating > 0 || minKmRuns > 0 || maxTransitHours > 0 || maxFlightHours > 0) ? "#0a1f35" : "transparent",
                  color: (showFilters || minLifts > 0 || minRating > 0 || minKmRuns > 0 || maxTransitHours > 0 || maxFlightHours > 0) ? t.colors.accentBlue : t.colors.tabInactiveText,
                  fontSize: t.fontSize.tabLabel,
                }}>
                  ⚙ Filters{(minLifts > 0 || minRating > 0 || minKmRuns > 0 || maxTransitHours > 0 || maxFlightHours > 0) ? " •" : ""}
                </button>
                <button onClick={() => { setMinRating(4.3); setMinLifts(30); setShowFilters(false); }} style={{
                  padding: "6px 14px", borderRadius: 10, cursor: "pointer", fontFamily: t.fonts.body,
                  border: `1px solid ${(minRating === 4.3 && minLifts === 30) ? t.colors.accentYellow : t.colors.borderSubtle}`,
                  background: (minRating === 4.3 && minLifts === 30) ? "#2a1e00" : "transparent",
                  color: (minRating === 4.3 && minLifts === 30) ? t.colors.accentYellow : t.colors.tabInactiveText,
                  fontSize: t.fontSize.tabLabel,
                }}>🏆 Top Resorts</button>
                {(minLifts > 0 || minRating > 0 || minKmRuns > 0 || maxTransitHours > 0 || maxFlightHours > 0) && (
                  <button onClick={() => { setMinLifts(0); setMinRating(0); setMinKmRuns(0); setMaxTransitHours(0); setMaxFlightHours(0); }} style={{
                    padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontFamily: t.fonts.body,
                    border: `1px solid ${t.colors.borderSubtle}`, background: "transparent",
                    color: t.colors.textMuted, fontSize: t.fontSize.tabLabel,
                  }}>✕ Clear</button>
                )}
              </div>
              {showFilters && (
                <div style={{ background: t.colors.statBg, border: `1px solid ${t.colors.borderSubtle}`, borderRadius: 12, padding: "18px 22px", display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 240 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>MIN LIFTS</span>
                      <span style={{ fontSize: t.fontSize.detailValue, fontWeight: 700, color: t.colors.accentBlue, fontFamily: t.fonts.mono, minWidth: 40, textAlign: "right" }}>{minLifts === 0 ? "Any" : `${minLifts}+`}</span>
                    </div>
                    <input type="range" min={0} max={200} step={10} value={minLifts} onChange={e => setMinLifts(Number(e.target.value))}
                      style={{ width: "100%", accentColor: t.colors.accentBlue, cursor: "pointer" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.colors.textFaint }}>
                      <span>Any</span><span>50</span><span>100</span><span>150</span><span>200+</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 240 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>MIN RATING</span>
                      <span style={{ fontSize: t.fontSize.detailValue, fontWeight: 700, color: t.colors.accentYellow, fontFamily: t.fonts.mono, minWidth: 40, textAlign: "right" }}>{minRating === 0 ? "Any" : `${minRating}★+`}</span>
                    </div>
                    <input type="range" min={0} max={5} step={0.1} value={minRating} onChange={e => setMinRating(Number(e.target.value))}
                      style={{ width: "100%", accentColor: t.colors.accentYellow, cursor: "pointer" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.colors.textFaint }}>
                      <span>Any</span><span>3.0★</span><span>4.0★</span><span>4.5★</span><span>5★</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 240 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>MIN KM OF RUNS</span>
                      <span style={{ fontSize: t.fontSize.detailValue, fontWeight: 700, color: t.colors.accentGreen, fontFamily: t.fonts.mono, minWidth: 50, textAlign: "right" }}>{minKmRuns === 0 ? "Any" : `${minKmRuns}km+`}</span>
                    </div>
                    <input type="range" min={0} max={650} step={25} value={minKmRuns} onChange={e => setMinKmRuns(Number(e.target.value))}
                      style={{ width: "100%", accentColor: t.colors.accentGreen, cursor: "pointer" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.colors.textFaint }}>
                      <span>Any</span><span>100km</span><span>250km</span><span>400km</span><span>650km</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 240 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>MAX TRANSFER TIME</span>
                      <span style={{ fontSize: t.fontSize.detailValue, fontWeight: 700, color: t.colors.accentPurple, fontFamily: t.fonts.mono, minWidth: 50, textAlign: "right" }}>{maxTransitHours === 0 ? "Any" : `≤${maxTransitHours}h`}</span>
                    </div>
                    <input type="range" min={0} max={5} step={0.25} value={maxTransitHours} onChange={e => setMaxTransitHours(Number(e.target.value))}
                      style={{ width: "100%", accentColor: t.colors.accentPurple, cursor: "pointer" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.colors.textFaint }}>
                      <span>Any</span><span>1.5h</span><span>2.5h</span><span>3.5h</span><span>5h</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 240 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8 }}>MAX FLIGHT TIME</span>
                      <span style={{ fontSize: t.fontSize.detailValue, fontWeight: 700, color: t.colors.accentBlue, fontFamily: t.fonts.mono, minWidth: 50, textAlign: "right" }}>{maxFlightHours === 0 ? "Any" : `≤${maxFlightHours}h`}</span>
                    </div>
                    <input type="range" min={0} max={5} step={0.25} value={maxFlightHours} onChange={e => setMaxFlightHours(Number(e.target.value))}
                      style={{ width: "100%", accentColor: t.colors.accentBlue, cursor: "pointer" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.colors.textFaint }}>
                      <span>Any</span><span>1.5h</span><span>2.5h</span><span>3.5h</span><span>5h</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {view === "cards" ? (
              <>
                {(() => {
                  const filtered = [...latest.resorts]
                    .filter(r => {
                      const meta = RESORTS.find(x => x.id === r.resort_id);
                      if (r.lifts.total < minLifts) return false;
                      if (r.composite_rating < minRating) return false;
                      if (meta && minKmRuns > 0 && meta.km_of_runs < minKmRuns) return false;
                      if (meta && maxTransitHours > 0 && meta.primary_airport.transit_hours > maxTransitHours) return false;
                      return true;
                    })
                    .sort((a, b) => {
                      if (top6Sort === "snow") return parseFloat(b.forecast.total_7day_snow_cm) - parseFloat(a.forecast.total_7day_snow_cm);
                      if (top6Sort === "rating") return b.composite_rating - a.composite_rating;
                      return b.lifts.total - a.lifts.total;
                    });
                  return filtered.length === 0 ? (
                    <div style={{ color: t.colors.textMuted, fontSize: t.fontSize.subtext, padding: "20px 0" }}>No resorts match your filters — try lowering the minimums.</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 18 }}>
                      {filtered.map(resort => (
                        <ResortCard
                          key={resort.resort_id} resort={resort}
                          prev={previous?.resorts.find(r => r.resort_id === resort.resort_id)}
                          isFav={favourites.includes(resort.resort_id)}
                          onToggleFav={() => toggleFav(resort.resort_id)}
                          departDate={departDate} returnDate={returnDate} displayCurrency={displayCurrency}
                          preferredDeparture={preferredDeparture}
                        />
                      ))}
                    </div>
                  );
                })()}
              </>
            ) : (
              <TableView latest={latest} prev={previous} favourites={favourites} onToggleFav={toggleFav} displayCurrency={displayCurrency} />
            )}
            <HistoryPanel history={history} />
            <div style={{ display: "flex", gap: 20, fontSize: t.fontSize.subtext, color: t.colors.textMuted, paddingTop: 10, borderTop: `1px solid ${t.colors.borderSubtle}`, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: t.colors.accentBlue }} />Next 3 days</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: t.colors.accentPurple }} />Following 4 days</span>
              <span style={{ color: t.colors.priceLow }}>● Low price</span>
              <span style={{ color: t.colors.priceTypical }}>● Typical</span>
              <span style={{ color: t.colors.priceHigh }}>● High price</span>
              <span style={{ marginLeft: "auto" }}>▲▼ = change vs prev run · Open-Meteo + SerpApi</span>
            </div>
          </>
        ) : !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", gap: 14 }}>
            <span style={{ fontSize: 52 }}>🏔️</span>
            <div style={{ fontSize: 18, color: t.colors.textSecondary }}>No forecast data yet</div>
            <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>Hit Refresh to pull live snow forecasts</div>
          </div>
        )}
      </div>
    </div>
  );
}