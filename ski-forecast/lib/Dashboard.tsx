"use client";
// app/components/Dashboard.tsx

import { useState, useCallback } from "react";
import { ForecastRun, ResortSnapshot } from "@/lib/resorts";
import { theme as t } from "@/lib/theme";

const MAX_HISTORY = 6;

const FLAG: Record<string, string> = {
  CH: "🇨🇭", FR: "🇫🇷", AT: "🇦🇹", IT: "🇮🇹", US: "🇺🇸", CA: "🇨🇦",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

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

function SnowBar({ days, color }: { days: any[]; color: string }) {
  const max = Math.max(...days.map(d => d.snowfall_cm), 1);
  return (
    <div style={{ display: "flex", gap: t.bars.gap, alignItems: "flex-end", height: t.bars.height }}>
      {days.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: "100%",
            borderRadius: t.bars.radius,
            height: Math.max(t.bars.minBarHeight, (d.snowfall_cm / max) * t.bars.maxBarHeight),
            background: color,
            opacity: 0.9,
            transition: "height 0.5s ease",
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
    <div style={{
      background: t.colors.statBg,
      borderRadius: t.card.statRadius,
      padding: t.card.statPadding,
    }}>
      <div style={{ fontSize: t.fontSize.sectionLabel, color: t.colors.textMuted, letterSpacing: 0.8, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: t.fontSize.statValue, fontWeight: 700, fontFamily: t.fonts.mono, color: t.colors.textPrimary }}>
        {value}
      </div>
      <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, marginTop: 2 }}>{sub}</div>
      {barPct !== undefined && (
        <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: t.colors.borderSubtle }}>
          <div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>
      )}
    </div>
  );
}

function ResortCard({ resort, prev }: { resort: ResortSnapshot; prev?: ResortSnapshot }) {
  const { next_3_days, following_4_days, total_7day_snow_cm } = resort.forecast;
  const liftsPercent = Math.round((resort.lifts.open / resort.lifts.total) * 100);
  const flag = FLAG[resort.country] ?? resort.country;

  return (
    <div style={{
      background: t.colors.cardBg,
      border: `1px solid ${t.colors.borderActive}`,
      borderRadius: t.card.borderRadius,
      padding: t.card.padding,
      display: "flex", flexDirection: "column", gap: t.card.gap,
      position: "relative", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{flag}</span>
            <h3 style={{
              margin: 0, fontSize: t.fontSize.resortName, fontWeight: 700,
              color: t.colors.textPrimary, fontFamily: t.fonts.heading, letterSpacing: -0.3,
            }}>{resort.resort_name}</h3>
          </div>
          <StarRating score={resort.composite_rating} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: t.fontSize.snowTotal, fontWeight: 800, color: t.colors.accentBlue, fontFamily: t.fonts.mono, lineHeight: 1 }}>
            {total_7day_snow_cm}
            <span style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, fontWeight: 400 }}> cm</span>
          </div>
          <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, marginTop: 2 }}>7-day total</div>
          <Delta current={total_7day_snow_cm} previous={prev?.forecast.total_7day_snow_cm} />
        </div>
      </div>

      {/* Snow bars */}
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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <StatBox
          label="Lifts Open"
          value={<span style={{ color: t.colors.accentGreen }}>{resort.lifts.open}</span>}
          sub={`of ${resort.lifts.total} (${liftsPercent}%)`}
          barPct={liftsPercent}
          barColor={t.colors.accentGreen}
        />
        <StatBox
          label="Snow Depth"
          value={<>{next_3_days[0]?.snow_depth_cm ?? "—"}<span style={{ fontSize: 12, color: t.colors.textMuted }}> cm</span></>}
          sub="at resort level"
        />
        <StatBox
          label="Private Lesson"
          value={<span style={{ color: t.colors.accentYellow }}>{resort.private_instruction.price_per_hour}</span>}
          sub={`${resort.private_instruction.currency} per hour`}
        />
      </div>
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
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 10,
            background: i === 0 ? t.colors.historyActiveBg : t.colors.historyRowBg,
            border: `1px solid ${i === 0 ? t.colors.borderActive : "transparent"}`,
          }}>
            <div style={{ fontSize: t.fontSize.historyTime, color: i === 0 ? t.colors.accentBlue : t.colors.textMuted, fontFamily: t.fonts.mono, minWidth: 150 }}>
              {i === 0 ? "▶ " : "  "}
              {new Date(run.fetched_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ display: "flex", gap: 20, flex: 1, flexWrap: "wrap" }}>
              {run.resorts.map(r => {
                const prevRun = history[i + 1];
                const prevResort = prevRun?.resorts.find(x => x.resort_id === r.resort_id);
                const diff = prevResort ? parseFloat(r.forecast.total_7day_snow_cm) - parseFloat(prevResort.forecast.total_7day_snow_cm) : null;
                return (
                  <div key={r.resort_id} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: t.fontSize.historyTime, fontWeight: 700, color: t.colors.textSecondary, fontFamily: t.fonts.mono }}>
                      {r.forecast.total_7day_snow_cm}
                      <span style={{ fontSize: 9, color: t.colors.textMuted }}>cm</span>
                      {diff !== null && Math.abs(diff) >= 0.1 && (
                        <span style={{ fontSize: 10, marginLeft: 3, color: diff > 0 ? t.colors.accentGreen : t.colors.accentRed }}>
                          {diff > 0 ? "▲" : "▼"}
                        </span>
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

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function Dashboard({ initialHistory }: { initialHistory: ForecastRun[] }) {
  const [history, setHistory] = useState<ForecastRun[]>(initialHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fetch-forecasts");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setHistory(json.history);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const latest = history[0];
  const previous = history[1];

  return (
    <div style={{ minHeight: "100vh", background: t.colors.pageBg, paddingBottom: 60 }}>

      {/* Header */}
      <div style={{
        background: t.colors.headerBg,
        borderBottom: `1px solid ${t.colors.borderSubtle}`,
        padding: "24px 32px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>⛷️</span>
            <div>
              <h1 style={{ margin: 0, fontSize: t.fontSize.appTitle, fontWeight: 700, color: t.colors.textPrimary, fontFamily: t.fonts.heading }}>
                Ski Forecast Desk
              </h1>
              <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted, marginTop: 2 }}>
                {latest
                  ? <>Last run: <strong style={{ color: t.colors.textSecondary }}>{new Date(latest.fetched_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</strong> · {MAX_HISTORY - history.length} history slots remaining</>
                  : "No data yet — hit Refresh to load forecasts"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/api/export-csv" style={{
              padding: "9px 18px", borderRadius: 10, border: `1px solid ${t.colors.borderActive}`,
              background: "transparent", color: t.colors.textSecondary,
              fontSize: t.fontSize.subtext, textDecoration: "none",
              fontFamily: t.fonts.body,
              pointerEvents: latest ? "auto" : "none",
              opacity: latest ? 1 : 0.4,
            }}>
              ↓ Export CSV
            </a>
            <button onClick={refresh} disabled={loading} style={{
              padding: "9px 22px", borderRadius: 10, border: "none",
              background: loading ? t.colors.refreshBtnDisabled : t.colors.refreshBtn,
              color: loading ? t.colors.textMuted : "#fff",
              fontSize: t.fontSize.subtext, fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              fontFamily: t.fonts.body,
            }}>
              {loading ? "⟳ Fetching…" : "⟳ Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: "13px 18px", color: t.colors.accentRed, fontSize: t.fontSize.subtext }}>
            ⚠️ {error}
          </div>
        )}

        {history.length >= MAX_HISTORY && (
          <div style={{ background: "#1c1400", border: "1px solid #3f2d00", borderRadius: 12, padding: "11px 18px", color: t.colors.accentYellow, fontSize: t.fontSize.subtext }}>
            📋 History full — next refresh will drop the oldest run.
          </div>
        )}

        {latest ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
            {latest.resorts.map((resort) => (
              <ResortCard
                key={resort.resort_id}
                resort={resort}
                prev={previous?.resorts.find(r => r.resort_id === resort.resort_id)}
              />
            ))}
          </div>
        ) : !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", gap: 14 }}>
            <span style={{ fontSize: 52 }}>🏔️</span>
            <div style={{ fontSize: 18, color: t.colors.textSecondary }}>No forecast data yet</div>
            <div style={{ fontSize: t.fontSize.subtext, color: t.colors.textMuted }}>Hit Refresh to pull live snow forecasts</div>
          </div>
        )}

        <HistoryPanel history={history} />

        {latest && (
          <div style={{ display: "flex", gap: 20, fontSize: t.fontSize.subtext, color: t.colors.textMuted, paddingTop: 10, borderTop: `1px solid ${t.colors.borderSubtle}` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: t.colors.accentBlue }} />
              Next 3 days snowfall
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: t.colors.accentPurple }} />
              Following 4 days snowfall
            </span>
            <span style={{ marginLeft: "auto" }}>▲ ▼ = change vs previous run · data: Open-Meteo</span>
          </div>
        )}
      </div>
    </div>
  );
}
