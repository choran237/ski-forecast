// lib/theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// THEME — edit everything here, it flows through the whole dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {

  // ── Fonts ──────────────────────────────────────────────────────────────────
  // Change these to any Google Font name - just make sure to also update the
  // import URL in app/layout.tsx to include the new font name
  fonts: {
    heading:  "'DM Serif Display', Georgia, serif",  // Resort names, app title
    body:     "'DM Sans', system-ui, sans-serif",     // All other text
    mono:     "'DM Mono', monospace",                  // Numbers, snowfall values
  },

  // ── Font sizes ─────────────────────────────────────────────────────────────
  fontSize: {
    appTitle:      22,   // "Ski Forecast Desk" in header
    resortName:    20,   // Resort name on each card
    snowTotal:     28,   // Big 7-day total number
    statValue:     18,   // Lifts open / snow depth / lesson price numbers
    sectionLabel:  11,   // "NEXT 3 DAYS", "LIFTS OPEN" etc
    barValue:      11,   // Numbers above snow bars
    barDay:        10,   // Day labels below snow bars (Mon, Tue...)
    subtext:       12,   // Secondary text, units, descriptions
    historyTime:   12,   // Timestamps in history panel
    badge:         11,   // Country badge, delta badge
  },

  // ── Colours ────────────────────────────────────────────────────────────────
  colors: {
    // Backgrounds
    pageBg:        "#020817",   // Whole page background
    headerBg:      "#0a1628",   // Top header bar
    cardBg:        "#0f172a",   // Resort cards
    cardBgAlt:     "#1e293b",   // Slightly lighter card variant
    statBg:        "#0b1222",   // Stat boxes inside cards (lifts/depth/price)
    historyBg:     "#0b1222",   // History panel background
    historyRowBg:  "#0f172a",   // Each history row
    historyActiveBg: "#0c1e35", // Latest/active history row

    // Borders
    borderSubtle:  "#1e293b",   // Card borders, dividers
    borderActive:  "#1e3a5f",   // Highlighted borders

    // Text
    textPrimary:   "#f0f9ff",   // Headings, resort names
    textSecondary: "#94a3b8",   // Body text, descriptions
    textMuted:     "#475569",   // Labels, units, timestamps
    textFaint:     "#334155",   // Very subtle text, day labels

    // Accents
    accentBlue:    "#38bdf8",   // Primary accent - snow totals, highlights
    accentPurple:  "#818cf8",   // Secondary accent - following 4 days bars
    accentGreen:   "#4ade80",   // Positive delta, lifts open bar
    accentYellow:  "#fbbf24",   // Stars, lesson price
    accentRed:     "#f87171",   // Negative delta

    // Buttons
    refreshBtn:    "linear-gradient(135deg, #0ea5e9, #3b82f6)",
    refreshBtnDisabled: "#1e3a5f",
  },

  // ── Spacing & shape ────────────────────────────────────────────────────────
  card: {
    borderRadius:  16,   // Card corner radius
    padding:       22,   // Card inner padding
    gap:           14,   // Gap between sections inside card
    statRadius:    10,   // Stat box corner radius
    statPadding:   12,   // Stat box inner padding
  },

  // ── Snow bar chart ─────────────────────────────────────────────────────────
  bars: {
    height:        44,   // Total bar chart height in px
    maxBarHeight:  38,   // Tallest bar height in px
    minBarHeight:  4,    // Shortest bar height in px (so 0 days still show)
    gap:           3,    // Gap between bars
    radius:        3,    // Bar corner radius
    colorNext3:    "linear-gradient(180deg, #38bdf8, #0ea5e9)",    // Next 3 days
    colorNext4:    "linear-gradient(180deg, #818cf8, #6366f1)",    // Following 4 days
  },

};

export type Theme = typeof theme;
