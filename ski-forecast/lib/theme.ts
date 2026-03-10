// lib/theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// THEME — edit everything here, it flows through the whole dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {

  // ── Fonts ──────────────────────────────────────────────────────────────────
  fonts: {
    heading:  "'DM Serif Display', Georgia, serif",
    body:     "'DM Sans', system-ui, sans-serif",
    mono:     "'DM Mono', monospace",
  },

  // ── Font sizes ─────────────────────────────────────────────────────────────
  fontSize: {
    appTitle:      22,
    resortName:    20,
    snowTotal:     28,
    statValue:     18,
    sectionLabel:  11,
    barValue:      11,
    barDay:        10,
    subtext:       12,
    historyTime:   12,
    badge:         11,
    // New
    flightPrice:   20,   // Big flight price on card
    flightSub:     11,   // "LHR → GVA · return" label
    favStrip:      13,   // Favourites strip resort name
    tableHeader:   11,   // Table column headers
    tableCell:     13,   // Table cell text
    top6Title:     15,   // Top 6 widget resort name
    top6Snow:      22,   // Top 6 snowfall number
    detailSection: 13,   // Detail page section labels
    detailValue:   16,   // Detail page values
    tabLabel:      12,   // View toggle tab labels
  },

  // ── Colours ────────────────────────────────────────────────────────────────
  colors: {
    // Backgrounds
    pageBg:           "#020817",
    headerBg:         "#0a1628",
    cardBg:           "#0f172a",
    cardBgAlt:        "#1e293b",
    statBg:           "#0b1222",
    historyBg:        "#0b1222",
    historyRowBg:     "#0f172a",
    historyActiveBg:  "#0c1e35",

    // New backgrounds
    favStripBg:       "#0a1f0a",   // Favourites strip background
    favStripBorder:   "#1a3a1a",   // Favourites strip border
    top6Bg:           "#0d1b2e",   // Top 6 widget background
    tableBg:          "#0b1222",   // Table background
    tableRowHover:    "#111f35",   // Table row hover
    tableHeaderBg:    "#0a1628",   // Table header row
    flightBg:         "#0a1a2e",   // Flight price box background
    flightBorder:     "#1e3a5f",   // Flight price box border
    detailBg:         "#0d1b2e",   // Detail page background
    tabActiveBg:      "#1e3a5f",   // Active tab background
    tabInactiveBg:    "transparent",

    // Borders
    borderSubtle:     "#1e293b",
    borderActive:     "#1e3a5f",

    // Text
    textPrimary:      "#f0f9ff",
    textSecondary:    "#94a3b8",
    textMuted:        "#475569",
    textFaint:        "#334155",

    // Accents
    accentBlue:       "#38bdf8",
    accentPurple:     "#818cf8",
    accentGreen:      "#4ade80",
    accentYellow:     "#fbbf24",
    accentRed:        "#f87171",
    accentOrange:     "#fb923c",   // Price level "high" indicator

    // Favourite star
    favActive:        "#fbbf24",   // Starred favourite
    favInactive:      "#334155",   // Unstarred

    // Flight price level colours
    priceLow:         "#4ade80",
    priceTypical:     "#94a3b8",
    priceHigh:        "#fb923c",

    // Buttons
    refreshBtn:       "linear-gradient(135deg, #0ea5e9, #3b82f6)",
    refreshBtnDisabled: "#1e3a5f",
    flightBtn:        "linear-gradient(135deg, #059669, #10b981)",
    flightBtnLoading: "#1e3a5f",
    tabActiveText:    "#f0f9ff",
    tabInactiveText:  "#475569",
  },

  // ── Spacing & shape ────────────────────────────────────────────────────────
  card: {
    borderRadius:  16,
    padding:       22,
    gap:           14,
    statRadius:    10,
    statPadding:   12,
  },

  // ── Snow bar chart ─────────────────────────────────────────────────────────
  bars: {
    height:        44,
    maxBarHeight:  38,
    minBarHeight:  4,
    gap:           3,
    radius:        3,
    colorNext3:    "linear-gradient(180deg, #38bdf8, #0ea5e9)",
    colorNext4:    "linear-gradient(180deg, #818cf8, #6366f1)",
  },

  // ── Top 6 widget ───────────────────────────────────────────────────────────
  top6: {
    cardWidth:     160,
    cardRadius:    14,
    cardPadding:   16,
    rankSize:      11,
  },

  // ── Table ──────────────────────────────────────────────────────────────────
  table: {
    rowHeight:     48,
    cellPaddingH:  14,
    cellPaddingV:  10,
    borderRadius:  12,
  },

  // ── Favourites strip ───────────────────────────────────────────────────────
  favStrip: {
    height:        90,
    cardWidth:     140,
    cardRadius:    10,
    cardPadding:   12,
  },

};

export type Theme = typeof theme;
