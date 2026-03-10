"use client";
// app/components/Dashboard.tsx

import { useState, useCallback } from "react";
import { ForecastRun, ResortSnapshot } from "@/lib/resorts";

const MAX_HISTORY = 6;

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 13, color: i <= Math.round(score) ? "#fbbf24" : "#1e293b" }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: "#64748b", marginLeft: 4 }}>{score}</span>
    </div>
  );
}

function SnowBar({ days, color }: { days: any[]; color: string }) {
  const max = Math.max(...days.map(d => d.snowfall_cm), 1);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 44 }}>
      {days.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: "100%", borderRadius: 3,
            height: Math.max(4, (d.snowfall_cm / max) * 38),
            background: color, opacity: 0.9,
            transition: "height 0.5s ease",
          }} />
          <span style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>
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
      fontSize: 11, marginLeft: 6, padding: "1px 7px", borderRadius: 99,
      background: zero ? "#1e293b" : diff > 0 ? "#052e16" : "#450a0a",
      color: zero ? "#64748b" : diff > 0 ? "#4ade80" : "#f87171",
      fontFamily: "monospace",
    }}>
      {zero ? "—" : `${diff > 0 ? "▲" : "▼"} ${abs} cm`}
    </span>
  );
}

function ResortCard({ resort, prev }: { resort: ResortSnapshot; prev?: ResortSnapshot }) {
  const { next_3_days, following_4_days, total_7day_snow_cm } = resort.forecast;
  const liftsPercent = Math.round((resort.lifts.open / resort.lifts.total) * 100);

  return (
    <div style={{
      background: "linear-gradient(135deg,#0f172a 0%,#1a2744 100%)",
      border: "1px solid #1e3a5f", borderRadius: 16,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -50, right: -50, width: 130, height: 130,
        borderRadius: "50%", background: "rgba(56,189,248,0.05)", pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 1, padding: "2px 7px",
              borderRadius: 6, background: "#1e293b", color: "#64748b",
            }}>{resort.country}</span>
            <h3 style={{
              fontSize: 17, fontWeight: 700, color: "#f0f9ff",
              fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: -0.3,
            }}>{resort.resort_name}</h3>
          </div>
          <StarRating score={resort.composite_rating} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#38bdf8", fontFamily: "monospace", lineHeight: 1 }}>
            {total_7day_snow_cm}
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}> cm</span>
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>7-day total</div>
          <Delta current={total_7day_snow_cm} previous={prev?.forecast.total_7day_snow_cm} />
        </div>
      </div>

      {/* Snow bars */}
      <div>
        <div style={{ display: "flex", marginBottom: 5 }}>
          <div style={{ flex: 3, fontSize: 10, color: "#38bdf8", letterSpacing: 1, textTransform: "uppercase" }}>Next 3 days</div>
          <div style={{ width: 1 }} />
          <div style={{ flex: 4, fontSize: 10, color: "#818cf8", letterSpacing: 1, textTransform: "uppercase", paddingLeft: 10 }}>Following 4 days</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 3 }}>
            <SnowBar days={next_3_days} color="linear-gradient(180deg,#38bdf8,#0ea5e9)" />
          </div>
          <div style={{ width: 1, height: 44, background: "#1e3a5f", flexShrink: 0 }} />
          <div style={{ flex: 4 }}>
            <SnowBar days={following_4_days} color="linear-gradient(180deg,#818cf8,#6366f1)" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
          {[...next_3_days, ...following_4_days].map((d, i) => (
            <div key={i} style={{ flex: 1, fontSize: 9, color: "#334155", textAlign: "center" }}>
              {new Date(d.date).toLocaleDateString("en-GB", { weekday: "short" }).slice(0,2)}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          {
            label: "LIFTS OPEN",
            value: <><span style={{ color: "#4ade80" }}>{resort.lifts.open}</span></>,
            sub: `of ${resort.lifts.total} (${liftsPercent}%)`,
            bar: liftsPercent,
            barColor: "#4ade80",
          },
          {
            label: "SNOW DEPTH",
            value: <><span style={{ color: "#e0f2fe" }}>{next_3_days[0]?.snow_depth_cm ?? "—"}</span><span style={{ fontSize: 10, color: "#64748b" }}> cm</span></>,
            sub: "at resort level",
          },
          {
            label: "PRIVATE LESSON",
            value: <><span style={{ color: "#fbbf24" }}>{resort.private_instruction.price_per_hour}</span><span style={{ fontSize: 10, color: "#64748b" }}> {resort.private_instruction.currency}/hr</span></>,
            sub: "ski school rate",
          },
        ].map(({ label, value, sub, bar, barColor }) => (
          <div key={label} style={{ background: "#0b1222", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{value}</div>
            <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>{sub}</div>
            {bar !== undefined && (
              <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: "#1e293b" }}>
                <div style={{ height: "100%", width: `${bar}%`, background: barColor, borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryPanel({ history }: { history: ForecastRun[] }) {
  if (history.length < 2) return null;
  return (
    <div style={{ background: "#0b1222", border: "1px solid #1e293b", borderRadius: 16, padding: "20px 22px" }}>
      <h3 style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
        Forecast History · {history.length} / {MAX_HISTORY} runs stored
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {history.map((run, i) => (
          <div key={run.fetched_at} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 10,
            background: i === 0 ? "#0c1e35" : "#0f172a",
            border: `1px solid ${i === 0 ? "#1e3a5f" : "transparent"}`,
          }}>
            <div style={{ fontSize: 11, color: i === 0 ? "#38bdf8" : "#334155", fontFamily: "monospace", minWidth: 160 }}>
              {i === 0 ? "▶ " : "  "}
              {new Date(run.fetched_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ display: "flex", gap: 20, flex: 1, flexWrap: "wrap" }}>
              {run.resorts.map(r => {
                const prevRun = history[i + 1];
                const prevResort = prevRun?.resorts.find(x => x.resort_id === r.resort_id);
                const diff = prevResort
                  ? parseFloat(r.forecast.total_7day_snow_cm) - parseFloat(prevResort.forecast.total_7day_snow_cm)
                  : null;
                return (
                  <div key={r.resort_id} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", fontFamily: "monospace" }}>
                      {r.forecast.total_7day_snow_cm}
                      <span style={{ fontSize: 9, color: "#475569" }}>cm</span>
                      {diff !== null && Math.abs(diff) >= 0.1 && (
                        <span style={{ fontSize: 10, marginLeft: 3, color: diff > 0 ? "#4ade80" : "#f87171" }}>
                          {diff > 0 ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: "#334155" }}>{r.resort_name.split(" ")[0]}</div>
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

// ─── Main Dashboard ────────────────────────────────────────────────────────────

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
    <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg,#0a1628,#020817)",
        borderBottom: "1px solid #1e293b",
        padding: "24px 32px",
        position: "sticky", top: 0, zIndex: 10,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 30 }}>⛷️</span>
            <div>
              <h1 style={{
                fontSize: 22, fontWeight: 700, color: "#f0f9ff",
                fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: -0.4,
              }}>Ski Forecast Desk</h1>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                {latest
                  ? <>Last run: <strong style={{ color: "#64748b" }}>{new Date(latest.fetched_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</strong> · {MAX_HISTORY - history.length} history slots remaining</>
                  : "No data yet — hit Refresh to load forecasts"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <a
              href="/api/export-csv"
              style={{
                padding: "9px 18px", borderRadius: 10, border: "1px solid #1e3a5f",
                background: "transparent", color: latest ? "#94a3b8" : "#334155",
                fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
                pointerEvents: latest ? "auto" : "none",
                transition: "all 0.2s",
              }}
            >
              ↓ Export CSV
            </a>
            <button
              onClick={refresh}
              disabled={loading}
              style={{
                padding: "9px 22px", borderRadius: 10, border: "none",
                background: loading ? "#1e3a5f" : "linear-gradient(135deg,#0ea5e9,#3b82f6)",
                color: loading ? "#475569" : "#fff",
                fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.2,
              }}
            >
              {loading ? <span style={{ animation: "pulse 1.2s infinite" }}>⟳ Fetching…</span> : "⟳ Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: "13px 18px", color: "#fca5a5", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {history.length >= MAX_HISTORY && (
          <div style={{ background: "#1c1400", border: "1px solid #3f2d00", borderRadius: 12, padding: "11px 18px", color: "#fbbf24", fontSize: 12 }}>
            📋 History full ({MAX_HISTORY}/{MAX_HISTORY}) — next refresh will drop the oldest run.
          </div>
        )}

        {latest ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
            {latest.resorts.map((resort, i) => (
              <div key={resort.resort_id} style={{ animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
                <ResortCard
                  resort={resort}
                  prev={previous?.resorts.find(r => r.resort_id === resort.resort_id)}
                />
              </div>
            ))}
          </div>
        ) : !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", gap: 14, color: "#475569" }}>
            <span style={{ fontSize: 52 }}>🏔️</span>
            <div style={{ fontSize: 17, color: "#64748b" }}>No forecast data yet</div>
            <div style={{ fontSize: 13 }}>Hit Refresh to pull live snow forecasts</div>
          </div>
        )}

        <HistoryPanel history={history} />

        {latest && (
          <div style={{ display: "flex", gap: 20, fontSize: 11, color: "#334155", paddingTop: 10, borderTop: "1px solid #1e293b" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#0ea5e9" }} />
              Next 3 days snowfall
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#818cf8" }} />
              Following 4 days snowfall
            </span>
            <span style={{ marginLeft: "auto" }}>▲ ▼ = change vs previous run · snow data: Open-Meteo</span>
          </div>
        )}
      </div>
    </div>
  );
}
