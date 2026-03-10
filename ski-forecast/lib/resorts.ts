// lib/resorts.ts

export interface SkiPassPrices {
  day_1: number;
  day_3: number;
  day_6: number;
  season: number;
  currency: string;
}

export interface SkiSchool {
  name: string;
  price_per_hour: number;
  currency: string;
}

export interface Airport {
  code: string;
  name: string;
  distance_km: number;
  transit_hours: number;  // drive/transfer time from airport to resort
  flight_mins: { LTN: number | null; LHR: number | null; LGW: number | null; STN: number | null };
}

export interface SnowData {
  base_depth_cm: number;       // typical base depth
  summit_depth_cm: number;     // typical summit depth
  avg_seasonal_cm: number;     // average seasonal snowfall for comparison
}

export interface Resort {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  composite_rating: number;
  total_lifts: number;
  total_runs: number;
  km_of_runs: number;
  elevation_m: number;          // mid-mountain elevation for accurate snow depth readings
  summit_elevation_m: number;   // highest accessible ski point
  private_per_hour: number;
  currency: string;
  primary_airport: Airport;
  alt_airports: Airport[];
  ski_schools: SkiSchool[];
  ski_pass: SkiPassPrices;
  snow_data: SnowData;
}

export const RESORTS: Resort[] = [

  // ── FRANCE ────────────────────────────────────────────────────────────────
  { id: "val_thorens", name: "Val Thorens", country: "FR", lat: 45.2975, lng: 6.5837, composite_rating: 4.5, total_lifts: 141, total_runs: 130, km_of_runs: 600, elevation_m: 2600, summit_elevation_m: 3200, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 165, transit_hours: 2.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 195, transit_hours: 2.75, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 120, transit_hours: 2.0, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF Val Thorens", price_per_hour: 75, currency: "EUR" }, { name: "Prosneige", price_per_hour: 85, currency: "EUR" }, { name: "Snow System", price_per_hour: 80, currency: "EUR" }],
    ski_pass: {day_1:55,day_3:145,day_6:265,season:950,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 300, avg_seasonal_cm: 700} },

  { id: "courchevel", name: "Courchevel", country: "FR", lat: 45.4147, lng: 6.6337, composite_rating: 4.7, total_lifts: 150, total_runs: 150, km_of_runs: 600, elevation_m: 2100, summit_elevation_m: 3000, private_per_hour: 120, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 155, transit_hours: 2.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 185, transit_hours: 2.5, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 110, transit_hours: 1.75, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF Courchevel", price_per_hour: 110, currency: "EUR" }, { name: "New Generation", price_per_hour: 120, currency: "EUR" }, { name: "BASS", price_per_hour: 115, currency: "EUR" }],
    ski_pass: {day_1:65,day_3:175,day_6:310,season:1100,currency:"EUR"},
    snow_data: {base_depth_cm: 70, summit_depth_cm: 290, avg_seasonal_cm: 650} },

  { id: "meribel", name: "Méribel", country: "FR", lat: 45.3997, lng: 6.5676, composite_rating: 4.6, total_lifts: 150, total_runs: 160, km_of_runs: 600, elevation_m: 2000, summit_elevation_m: 3200, private_per_hour: 100, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 155, transit_hours: 2.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 185, transit_hours: 2.5, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 110, transit_hours: 1.75, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF Méribel", price_per_hour: 90, currency: "EUR" }, { name: "New Generation", price_per_hour: 105, currency: "EUR" }, { name: "Magic in Motion", price_per_hour: 98, currency: "EUR" }],
    ski_pass: {day_1:62,day_3:168,day_6:295,season:1050,currency:"EUR"},
    snow_data: {base_depth_cm: 70, summit_depth_cm: 280, avg_seasonal_cm: 620} },

  { id: "les_menuires", name: "Les Menuires", country: "FR", lat: 45.3247, lng: 6.5424, composite_rating: 4.2, total_lifts: 160, total_runs: 160, km_of_runs: 600, elevation_m: 2200, summit_elevation_m: 3200, private_per_hour: 75, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 160, transit_hours: 2.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 190, transit_hours: 2.75, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 115, transit_hours: 2.0, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF Les Menuires", price_per_hour: 68, currency: "EUR" }, { name: "Ski Connections", price_per_hour: 72, currency: "EUR" }, { name: "Prosneige", price_per_hour: 75, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:900,currency:"EUR"},
    snow_data: {base_depth_cm: 75, summit_depth_cm: 290, avg_seasonal_cm: 640} },

  { id: "chamonix", name: "Chamonix", country: "FR", lat: 45.9237, lng: 6.8694, composite_rating: 4.4, total_lifts: 49, total_runs: 50, km_of_runs: 170, elevation_m: 2200, summit_elevation_m: 3842, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 90, transit_hours: 1.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 215, transit_hours: 3.0, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "TRN", name: "Turin", distance_km: 160, transit_hours: 2.5, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } }],
    ski_schools: [{ name: "ESF Chamonix", price_per_hour: 82, currency: "EUR" }, { name: "Compagnie du Mont Blanc", price_per_hour: 95, currency: "EUR" }, { name: "Ski Sensations", price_per_hour: 88, currency: "EUR" }],
    ski_pass: {day_1:58,day_3:155,day_6:278,season:980,currency:"EUR"},
    snow_data: {base_depth_cm: 60, summit_depth_cm: 350, avg_seasonal_cm: 800} },

  { id: "tignes", name: "Tignes", country: "FR", lat: 45.4683, lng: 6.9056, composite_rating: 4.4, total_lifts: 88, total_runs: 78, km_of_runs: 300, elevation_m: 2500, summit_elevation_m: 3456, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 175, transit_hours: 2.75, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 200, transit_hours: 3.0, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "TRN", name: "Turin", distance_km: 165, transit_hours: 2.75, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } }],
    ski_schools: [{ name: "ESF Tignes", price_per_hour: 82, currency: "EUR" }, { name: "Evolution 2", price_per_hour: 90, currency: "EUR" }, { name: "Reflex Ski", price_per_hour: 85, currency: "EUR" }],
    ski_pass: {day_1:58,day_3:155,day_6:278,season:990,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 360, avg_seasonal_cm: 720} },

  { id: "val_disere", name: "Val d'Isère", country: "FR", lat: 45.4483, lng: 6.9800, composite_rating: 4.7, total_lifts: 88, total_runs: 78, km_of_runs: 300, elevation_m: 2400, summit_elevation_m: 3450, private_per_hour: 100, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 175, transit_hours: 3.0, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 205, transit_hours: 3.25, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "TRN", name: "Turin", distance_km: 165, transit_hours: 2.75, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } }],
    ski_schools: [{ name: "ESF Val d'Isère", price_per_hour: 92, currency: "EUR" }, { name: "Top Ski", price_per_hour: 100, currency: "EUR" }, { name: "Snow Fun", price_per_hour: 95, currency: "EUR" }],
    ski_pass: {day_1:62,day_3:166,day_6:296,season:1060,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 340, avg_seasonal_cm: 700} },

  { id: "les_arcs", name: "Les Arcs", country: "FR", lat: 45.5706, lng: 6.8336, composite_rating: 4.3, total_lifts: 56, total_runs: 56, km_of_runs: 200, elevation_m: 2200, summit_elevation_m: 3226, private_per_hour: 80, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 165, transit_hours: 2.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 195, transit_hours: 2.75, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 120, transit_hours: 2.0, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF Les Arcs", price_per_hour: 72, currency: "EUR" }, { name: "Evolution 2", price_per_hour: 80, currency: "EUR" }, { name: "Alpine Ski School", price_per_hour: 75, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:890,currency:"EUR"},
    snow_data: {base_depth_cm: 65, summit_depth_cm: 280, avg_seasonal_cm: 600} },

  { id: "la_plagne", name: "La Plagne", country: "FR", lat: 45.5086, lng: 6.6738, composite_rating: 4.3, total_lifts: 130, total_runs: 130, km_of_runs: 425, elevation_m: 2100, summit_elevation_m: 3250, private_per_hour: 80, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 160, transit_hours: 2.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 190, transit_hours: 2.75, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 115, transit_hours: 2.0, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF La Plagne", price_per_hour: 72, currency: "EUR" }, { name: "Evolution 2", price_per_hour: 80, currency: "EUR" }, { name: "Oxygène", price_per_hour: 75, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:890,currency:"EUR"},
    snow_data: {base_depth_cm: 65, summit_depth_cm: 280, avg_seasonal_cm: 600} },

  { id: "alpe_dhuez", name: "Alpe d'Huez", country: "FR", lat: 45.0900, lng: 6.0706, composite_rating: 4.5, total_lifts: 78, total_runs: 82, km_of_runs: 248, elevation_m: 2400, summit_elevation_m: 3330, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "GNB", name: "Grenoble", distance_km: 65, transit_hours: 1.25, flight_mins: { LTN: 115, LHR: null, LGW: 115, STN: null } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 155, transit_hours: 2.25, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "GVA", name: "Geneva", distance_km: 205, transit_hours: 3.0, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } }],
    ski_schools: [{ name: "ESF Alpe d'Huez", price_per_hour: 82, currency: "EUR" }, { name: "Masterclass", price_per_hour: 92, currency: "EUR" }, { name: "Ski School International", price_per_hour: 86, currency: "EUR" }],
    ski_pass: {day_1:56,day_3:148,day_6:265,season:940,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 310, avg_seasonal_cm: 680} },

  { id: "les_deux_alpes", name: "Les Deux Alpes", country: "FR", lat: 45.0133, lng: 6.1211, composite_rating: 4.2, total_lifts: 56, total_runs: 96, km_of_runs: 220, elevation_m: 2600, summit_elevation_m: 3568, private_per_hour: 80, currency: "EUR",
    primary_airport: { code: "GNB", name: "Grenoble", distance_km: 75, transit_hours: 1.5, flight_mins: { LTN: 115, LHR: null, LGW: 115, STN: null } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 165, transit_hours: 2.5, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "GVA", name: "Geneva", distance_km: 215, transit_hours: 3.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } }],
    ski_schools: [{ name: "ESF Les Deux Alpes", price_per_hour: 72, currency: "EUR" }, { name: "Evolution 2", price_per_hour: 80, currency: "EUR" }, { name: "Ski School 2 Alpes", price_per_hour: 75, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:880,currency:"EUR"},
    snow_data: {base_depth_cm: 90, summit_depth_cm: 380, avg_seasonal_cm: 750} },

  { id: "morzine", name: "Morzine / Avoriaz", country: "FR", lat: 46.1783, lng: 6.7089, composite_rating: 4.3, total_lifts: 200, total_runs: 200, km_of_runs: 650, elevation_m: 1800, summit_elevation_m: 2254, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 75, transit_hours: 1.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 195, transit_hours: 2.75, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "ZRH", name: "Zurich", distance_km: 230, transit_hours: 3.0, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }],
    ski_schools: [{ name: "ESF Morzine", price_per_hour: 78, currency: "EUR" }, { name: "Avoriaz 1800", price_per_hour: 85, currency: "EUR" }, { name: "New Generation", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:55,day_3:145,day_6:265,season:940,currency:"EUR"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 250, avg_seasonal_cm: 520} },

  { id: "megeve", name: "Megève", country: "FR", lat: 45.8567, lng: 6.6172, composite_rating: 4.5, total_lifts: 107, total_runs: 80, km_of_runs: 325, elevation_m: 1900, summit_elevation_m: 2350, private_per_hour: 110, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 80, transit_hours: 1.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 190, transit_hours: 2.5, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 125, transit_hours: 2.0, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF Megève", price_per_hour: 100, currency: "EUR" }, { name: "Ski Academy", price_per_hour: 112, currency: "EUR" }, { name: "Megève Ski School", price_per_hour: 105, currency: "EUR" }],
    ski_pass: {day_1:60,day_3:158,day_6:285,season:1020,currency:"EUR"},
    snow_data: {base_depth_cm: 50, summit_depth_cm: 230, avg_seasonal_cm: 500} },

  { id: "serre_chevalier", name: "Serre Chevalier", country: "FR", lat: 44.9244, lng: 6.5444, composite_rating: 4.2, total_lifts: 61, total_runs: 61, km_of_runs: 250, elevation_m: 2200, summit_elevation_m: 2800, private_per_hour: 75, currency: "EUR",
    primary_airport: { code: "TRN", name: "Turin", distance_km: 110, transit_hours: 1.75, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } },
    alt_airports: [{ code: "GNB", name: "Grenoble", distance_km: 100, transit_hours: 1.75, flight_mins: { LTN: 115, LHR: null, LGW: 115, STN: null } }, { code: "MRS", name: "Marseille", distance_km: 240, transit_hours: 3.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF Serre Chevalier", price_per_hour: 68, currency: "EUR" }, { name: "Evolution 2", price_per_hour: 75, currency: "EUR" }, { name: "Altitude Ski School", price_per_hour: 70, currency: "EUR" }],
    ski_pass: {day_1:48,day_3:128,day_6:228,season:820,currency:"EUR"},
    snow_data: {base_depth_cm: 70, summit_depth_cm: 290, avg_seasonal_cm: 620} },

  { id: "la_clusaz", name: "La Clusaz", country: "FR", lat: 45.9044, lng: 6.4258, composite_rating: 4.1, total_lifts: 55, total_runs: 55, km_of_runs: 132, elevation_m: 1800, summit_elevation_m: 2600, private_per_hour: 75, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 60, transit_hours: 1.0, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "LYS", name: "Lyon", distance_km: 155, transit_hours: 2.25, flight_mins: { LTN: 110, LHR: 110, LGW: 110, STN: null } }, { code: "CMF", name: "Chambéry", distance_km: 130, transit_hours: 2.0, flight_mins: { LTN: 110, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "ESF La Clusaz", price_per_hour: 68, currency: "EUR" }, { name: "Glisse Alpine", price_per_hour: 75, currency: "EUR" }, { name: "Ski School La Clusaz", price_per_hour: 70, currency: "EUR" }],
    ski_pass: {day_1:46,day_3:120,day_6:215,season:790,currency:"EUR"},
    snow_data: {base_depth_cm: 50, summit_depth_cm: 220, avg_seasonal_cm: 480} },

  // ── SWITZERLAND ───────────────────────────────────────────────────────────
  { id: "verbier", name: "Verbier", country: "CH", lat: 46.0963, lng: 7.2275, composite_rating: 4.7, total_lifts: 87, total_runs: 94, km_of_runs: 410, elevation_m: 2700, summit_elevation_m: 3300, private_per_hour: 150, currency: "CHF",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 155, transit_hours: 2.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "ZRH", name: "Zurich", distance_km: 235, transit_hours: 3.25, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }, { code: "BSL", name: "Basel", distance_km: 220, transit_hours: 3.0, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Ski School Verbier", price_per_hour: 140, currency: "CHF" }, { name: "New Generation", price_per_hour: 155, currency: "CHF" }, { name: "European Snowsport", price_per_hour: 148, currency: "CHF" }],
    ski_pass: {day_1:78,day_3:205,day_6:365,season:1300,currency:"CHF"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 310, avg_seasonal_cm: 680} },

  { id: "zermatt", name: "Zermatt", country: "CH", lat: 46.0207, lng: 7.7491, composite_rating: 4.8, total_lifts: 52, total_runs: 73, km_of_runs: 360, elevation_m: 3000, summit_elevation_m: 3883, private_per_hour: 160, currency: "CHF",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 235, transit_hours: 3.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "ZRH", name: "Zurich", distance_km: 245, transit_hours: 3.5, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }, { code: "BSL", name: "Basel", distance_km: 260, transit_hours: 3.75, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Zermatt Ski School", price_per_hour: 150, currency: "CHF" }, { name: "Stoked Ski School", price_per_hour: 165, currency: "CHF" }, { name: "Summit Ski School", price_per_hour: 158, currency: "CHF" }],
    ski_pass: {day_1:82,day_3:220,day_6:390,season:1400,currency:"CHF"},
    snow_data: {base_depth_cm: 90, summit_depth_cm: 365, avg_seasonal_cm: 780} },

  { id: "st_moritz", name: "St. Moritz", country: "CH", lat: 46.4983, lng: 9.8383, composite_rating: 4.7, total_lifts: 57, total_runs: 88, km_of_runs: 350, elevation_m: 2500, summit_elevation_m: 3303, private_per_hour: 170, currency: "CHF",
    primary_airport: { code: "ZRH", name: "Zurich", distance_km: 200, transit_hours: 3.0, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } },
    alt_airports: [{ code: "BGY", name: "Milan Bergamo", distance_km: 190, transit_hours: 3.0, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: 130 } }, { code: "MXP", name: "Milan Malpensa", distance_km: 210, transit_hours: 3.25, flight_mins: { LTN: null, LHR: 130, LGW: null, STN: null } }],
    ski_schools: [{ name: "Ski School St. Moritz", price_per_hour: 160, currency: "CHF" }, { name: "Swiss Ski School", price_per_hour: 175, currency: "CHF" }, { name: "Stoked Engadin", price_per_hour: 168, currency: "CHF" }],
    ski_pass: {day_1:80,day_3:212,day_6:378,season:1350,currency:"CHF"},
    snow_data: {base_depth_cm: 75, summit_depth_cm: 310, avg_seasonal_cm: 660} },

  { id: "davos", name: "Davos / Klosters", country: "CH", lat: 46.8133, lng: 9.8378, composite_rating: 4.5, total_lifts: 56, total_runs: 56, km_of_runs: 316, elevation_m: 2200, summit_elevation_m: 2844, private_per_hour: 140, currency: "CHF",
    primary_airport: { code: "ZRH", name: "Zurich", distance_km: 150, transit_hours: 2.25, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } },
    alt_airports: [{ code: "FDH", name: "Friedrichshafen", distance_km: 165, transit_hours: 2.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "BSL", name: "Basel", distance_km: 210, transit_hours: 3.0, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Ski School Davos", price_per_hour: 130, currency: "CHF" }, { name: "Klosters Ski School", price_per_hour: 145, currency: "CHF" }, { name: "Swiss Ski School Davos", price_per_hour: 138, currency: "CHF" }],
    ski_pass: {day_1:72,day_3:192,day_6:342,season:1220,currency:"CHF"},
    snow_data: {base_depth_cm: 65, summit_depth_cm: 280, avg_seasonal_cm: 600} },

  { id: "grindelwald", name: "Grindelwald", country: "CH", lat: 46.6244, lng: 8.0411, composite_rating: 4.6, total_lifts: 45, total_runs: 45, km_of_runs: 213, elevation_m: 2200, summit_elevation_m: 2971, private_per_hour: 150, currency: "CHF",
    primary_airport: { code: "ZRH", name: "Zurich", distance_km: 120, transit_hours: 2.0, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } },
    alt_airports: [{ code: "BSL", name: "Basel", distance_km: 120, transit_hours: 2.0, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }, { code: "BRN", name: "Bern", distance_km: 65, transit_hours: 1.25, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Swiss Ski School Grindelwald", price_per_hour: 140, currency: "CHF" }, { name: "Grindelwald Sports", price_per_hour: 155, currency: "CHF" }, { name: "Eiger Ski School", price_per_hour: 148, currency: "CHF" }],
    ski_pass: {day_1:72,day_3:192,day_6:342,season:1220,currency:"CHF"},
    snow_data: {base_depth_cm: 70, summit_depth_cm: 290, avg_seasonal_cm: 640} },

  { id: "saas_fee", name: "Saas-Fee", country: "CH", lat: 46.1083, lng: 7.9283, composite_rating: 4.5, total_lifts: 22, total_runs: 22, km_of_runs: 100, elevation_m: 3000, summit_elevation_m: 3573, private_per_hour: 140, currency: "CHF",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 225, transit_hours: 3.25, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "ZRH", name: "Zurich", distance_km: 260, transit_hours: 3.75, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }, { code: "BSL", name: "Basel", distance_km: 265, transit_hours: 3.75, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Saas-Fee Ski School", price_per_hour: 130, currency: "CHF" }, { name: "Summit Ski", price_per_hour: 145, currency: "CHF" }, { name: "Swiss Ski School Saas", price_per_hour: 138, currency: "CHF" }],
    ski_pass: {day_1:68,day_3:180,day_6:320,season:1150,currency:"CHF"},
    snow_data: {base_depth_cm: 90, summit_depth_cm: 350, avg_seasonal_cm: 720} },

  { id: "wengen", name: "Wengen", country: "CH", lat: 46.6083, lng: 7.9225, composite_rating: 4.4, total_lifts: 45, total_runs: 45, km_of_runs: 213, elevation_m: 2200, summit_elevation_m: 2971, private_per_hour: 140, currency: "CHF",
    primary_airport: { code: "ZRH", name: "Zurich", distance_km: 115, transit_hours: 2.0, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } },
    alt_airports: [{ code: "BSL", name: "Basel", distance_km: 115, transit_hours: 2.0, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }, { code: "BRN", name: "Bern", distance_km: 60, transit_hours: 1.25, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Swiss Ski School Wengen", price_per_hour: 130, currency: "CHF" }, { name: "Privé Ski", price_per_hour: 145, currency: "CHF" }, { name: "Wengen Sports", price_per_hour: 135, currency: "CHF" }],
    ski_pass: {day_1:68,day_3:180,day_6:320,season:1150,currency:"CHF"},
    snow_data: {base_depth_cm: 65, summit_depth_cm: 270, avg_seasonal_cm: 580} },

  { id: "andermatt", name: "Andermatt", country: "CH", lat: 46.6344, lng: 8.5933, composite_rating: 4.4, total_lifts: 42, total_runs: 42, km_of_runs: 180, elevation_m: 2500, summit_elevation_m: 2961, private_per_hour: 130, currency: "CHF",
    primary_airport: { code: "ZRH", name: "Zurich", distance_km: 120, transit_hours: 1.75, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } },
    alt_airports: [{ code: "BSL", name: "Basel", distance_km: 145, transit_hours: 2.25, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }, { code: "BRN", name: "Bern", distance_km: 70, transit_hours: 1.25, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Swiss Ski School Andermatt", price_per_hour: 120, currency: "CHF" }, { name: "Andermatt Ski School", price_per_hour: 135, currency: "CHF" }, { name: "Ursern Ski School", price_per_hour: 128, currency: "CHF" }],
    ski_pass: {day_1:65,day_3:172,day_6:305,season:1090,currency:"CHF"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 340, avg_seasonal_cm: 720} },

  { id: "crans_montana", name: "Crans-Montana", country: "CH", lat: 46.3083, lng: 7.4800, composite_rating: 4.4, total_lifts: 30, total_runs: 30, km_of_runs: 160, elevation_m: 2400, summit_elevation_m: 2927, private_per_hour: 145, currency: "CHF",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 180, transit_hours: 2.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "ZRH", name: "Zurich", distance_km: 235, transit_hours: 3.25, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }, { code: "BSL", name: "Basel", distance_km: 220, transit_hours: 3.0, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Swiss Ski School Crans", price_per_hour: 135, currency: "CHF" }, { name: "Montana Ski School", price_per_hour: 148, currency: "CHF" }, { name: "Attitude Ski", price_per_hour: 142, currency: "CHF" }],
    ski_pass: {day_1:70,day_3:186,day_6:330,season:1180,currency:"CHF"},
    snow_data: {base_depth_cm: 65, summit_depth_cm: 270, avg_seasonal_cm: 560} },

  { id: "engelberg", name: "Engelberg", country: "CH", lat: 46.8211, lng: 8.4083, composite_rating: 4.3, total_lifts: 28, total_runs: 28, km_of_runs: 82, elevation_m: 2400, summit_elevation_m: 3020, private_per_hour: 130, currency: "CHF",
    primary_airport: { code: "ZRH", name: "Zurich", distance_km: 80, transit_hours: 1.25, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } },
    alt_airports: [{ code: "BSL", name: "Basel", distance_km: 100, transit_hours: 1.75, flight_mins: { LTN: 105, LHR: null, LGW: null, STN: null } }, { code: "BRN", name: "Bern", distance_km: 85, transit_hours: 1.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Swiss Ski School Engelberg", price_per_hour: 120, currency: "CHF" }, { name: "Skischule Engelberg", price_per_hour: 132, currency: "CHF" }, { name: "Top Secret Ski", price_per_hour: 128, currency: "CHF" }],
    ski_pass: {day_1:65,day_3:172,day_6:305,season:1090,currency:"CHF"},
    snow_data: {base_depth_cm: 70, summit_depth_cm: 310, avg_seasonal_cm: 680} },

  // ── AUSTRIA ───────────────────────────────────────────────────────────────
  { id: "st_anton", name: "St. Anton", country: "AT", lat: 47.1296, lng: 10.2686, composite_rating: 4.6, total_lifts: 88, total_runs: 88, km_of_runs: 305, elevation_m: 2300, summit_elevation_m: 2811, private_per_hour: 95, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 100, transit_hours: 1.5, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "FDH", name: "Friedrichshafen", distance_km: 120, transit_hours: 2.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "MUC", name: "Munich", distance_km: 185, transit_hours: 2.75, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Ski School St. Anton", price_per_hour: 88, currency: "EUR" }, { name: "Arlberg Ski School", price_per_hour: 98, currency: "EUR" }, { name: "Galzig Ski School", price_per_hour: 92, currency: "EUR" }],
    ski_pass: {day_1:58,day_3:155,day_6:278,season:990,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 310, avg_seasonal_cm: 720} },

  { id: "kitzbuhel", name: "Kitzbühel", country: "AT", lat: 47.4458, lng: 12.3914, composite_rating: 4.6, total_lifts: 55, total_runs: 54, km_of_runs: 200, elevation_m: 1800, summit_elevation_m: 2000, private_per_hour: 100, currency: "EUR",
    primary_airport: { code: "SZG", name: "Salzburg", distance_km: 80, transit_hours: 1.25, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } },
    alt_airports: [{ code: "INN", name: "Innsbruck", distance_km: 95, transit_hours: 1.5, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } }, { code: "MUC", name: "Munich", distance_km: 120, transit_hours: 1.75, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Rote Teufel", price_per_hour: 92, currency: "EUR" }, { name: "Total Kitzbühel", price_per_hour: 102, currency: "EUR" }, { name: "Ski Academy Kitzbühel", price_per_hour: 96, currency: "EUR" }],
    ski_pass: {day_1:60,day_3:160,day_6:285,season:1020,currency:"EUR"},
    snow_data: {base_depth_cm: 50, summit_depth_cm: 220, avg_seasonal_cm: 480} },

  { id: "solden", name: "Sölden", country: "AT", lat: 46.9594, lng: 11.0044, composite_rating: 4.5, total_lifts: 33, total_runs: 33, km_of_runs: 146, elevation_m: 2700, summit_elevation_m: 3250, private_per_hour: 95, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 90, transit_hours: 1.5, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "MUC", name: "Munich", distance_km: 210, transit_hours: 3.0, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }, { code: "BGY", name: "Milan Bergamo", distance_km: 240, transit_hours: 3.5, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: 130 } }],
    ski_schools: [{ name: "Ski School Sölden", price_per_hour: 88, currency: "EUR" }, { name: "Ötztaler Ski School", price_per_hour: 95, currency: "EUR" }, { name: "Alpin Sölden", price_per_hour: 90, currency: "EUR" }],
    ski_pass: {day_1:58,day_3:155,day_6:278,season:990,currency:"EUR"},
    snow_data: {base_depth_cm: 90, summit_depth_cm: 370, avg_seasonal_cm: 780} },

  { id: "ischgl", name: "Ischgl", country: "AT", lat: 47.0122, lng: 10.2911, composite_rating: 4.6, total_lifts: 45, total_runs: 45, km_of_runs: 238, elevation_m: 2400, summit_elevation_m: 2872, private_per_hour: 100, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 95, transit_hours: 1.5, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "FDH", name: "Friedrichshafen", distance_km: 130, transit_hours: 2.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "ZRH", name: "Zurich", distance_km: 225, transit_hours: 3.25, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }],
    ski_schools: [{ name: "Ski School Ischgl", price_per_hour: 92, currency: "EUR" }, { name: "Silvretta Ski School", price_per_hour: 102, currency: "EUR" }, { name: "Top Ischgl", price_per_hour: 96, currency: "EUR" }],
    ski_pass: {day_1:60,day_3:160,day_6:285,season:1020,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 310, avg_seasonal_cm: 680} },

  { id: "mayrhofen", name: "Mayrhofen", country: "AT", lat: 47.1667, lng: 11.8667, composite_rating: 4.3, total_lifts: 55, total_runs: 55, km_of_runs: 159, elevation_m: 2000, summit_elevation_m: 2500, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 65, transit_hours: 1.0, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "SZG", name: "Salzburg", distance_km: 130, transit_hours: 2.0, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } }, { code: "MUC", name: "Munich", distance_km: 175, transit_hours: 2.5, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Ski School Mayrhofen", price_per_hour: 78, currency: "EUR" }, { name: "Mount Everest Ski School", price_per_hour: 88, currency: "EUR" }, { name: "Zillertal Ski School", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:55,day_3:145,day_6:260,season:930,currency:"EUR"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 220, avg_seasonal_cm: 480} },

  { id: "lech_zurs", name: "Lech / Zürs", country: "AT", lat: 47.2086, lng: 10.1417, composite_rating: 4.7, total_lifts: 88, total_runs: 88, km_of_runs: 305, elevation_m: 2300, summit_elevation_m: 2450, private_per_hour: 110, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 110, transit_hours: 1.75, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "FDH", name: "Friedrichshafen", distance_km: 115, transit_hours: 1.75, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "ZRH", name: "Zurich", distance_km: 210, transit_hours: 3.0, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }],
    ski_schools: [{ name: "Ski School Lech", price_per_hour: 100, currency: "EUR" }, { name: "Zürs Ski School", price_per_hour: 112, currency: "EUR" }, { name: "Arlberg Lech", price_per_hour: 105, currency: "EUR" }],
    ski_pass: {day_1:62,day_3:165,day_6:295,season:1060,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 310, avg_seasonal_cm: 680} },

  { id: "saalbach", name: "Saalbach Hinterglemm", country: "AT", lat: 47.3919, lng: 12.6358, composite_rating: 4.4, total_lifts: 70, total_runs: 70, km_of_runs: 270, elevation_m: 2000, summit_elevation_m: 2096, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "SZG", name: "Salzburg", distance_km: 75, transit_hours: 1.25, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } },
    alt_airports: [{ code: "MUC", name: "Munich", distance_km: 145, transit_hours: 2.25, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }, { code: "INN", name: "Innsbruck", distance_km: 115, transit_hours: 1.75, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Ski School Saalbach", price_per_hour: 82, currency: "EUR" }, { name: "Hinterglemm Ski School", price_per_hour: 92, currency: "EUR" }, { name: "Intersport Ski School", price_per_hour: 86, currency: "EUR" }],
    ski_pass: {day_1:56,day_3:148,day_6:265,season:950,currency:"EUR"},
    snow_data: {base_depth_cm: 60, summit_depth_cm: 250, avg_seasonal_cm: 540} },

  { id: "hintertux", name: "Hintertux Glacier", country: "AT", lat: 47.0667, lng: 11.6667, composite_rating: 4.4, total_lifts: 22, total_runs: 22, km_of_runs: 86, elevation_m: 3000, summit_elevation_m: 3250, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 70, transit_hours: 1.25, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "SZG", name: "Salzburg", distance_km: 135, transit_hours: 2.0, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } }, { code: "MUC", name: "Munich", distance_km: 178, transit_hours: 2.5, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Ski School Hintertux", price_per_hour: 82, currency: "EUR" }, { name: "Tuxertal Ski School", price_per_hour: 92, currency: "EUR" }, { name: "Glacier Ski School", price_per_hour: 88, currency: "EUR" }],
    ski_pass: {day_1:56,day_3:148,day_6:265,season:950,currency:"EUR"},
    snow_data: {base_depth_cm: 200, summit_depth_cm: 500, avg_seasonal_cm: 900} },

  { id: "kaprun", name: "Zell am See / Kaprun", country: "AT", lat: 47.3253, lng: 12.7997, composite_rating: 4.3, total_lifts: 54, total_runs: 54, km_of_runs: 130, elevation_m: 2500, summit_elevation_m: 3029, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "SZG", name: "Salzburg", distance_km: 85, transit_hours: 1.25, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } },
    alt_airports: [{ code: "MUC", name: "Munich", distance_km: 155, transit_hours: 2.25, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }, { code: "INN", name: "Innsbruck", distance_km: 125, transit_hours: 2.0, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Ski School Zell am See", price_per_hour: 78, currency: "EUR" }, { name: "Kaprun Ski School", price_per_hour: 88, currency: "EUR" }, { name: "Schneesportschule", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:54,day_3:142,day_6:255,season:910,currency:"EUR"},
    snow_data: {base_depth_cm: 60, summit_depth_cm: 280, avg_seasonal_cm: 580} },

  { id: "bad_gastein", name: "Bad Gastein", country: "AT", lat: 47.1167, lng: 13.1333, composite_rating: 4.2, total_lifts: 49, total_runs: 49, km_of_runs: 200, elevation_m: 2000, summit_elevation_m: 2686, private_per_hour: 80, currency: "EUR",
    primary_airport: { code: "SZG", name: "Salzburg", distance_km: 95, transit_hours: 1.5, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } },
    alt_airports: [{ code: "VIE", name: "Vienna", distance_km: 310, transit_hours: 4.0, flight_mins: { LTN: 155, LHR: 155, LGW: 155, STN: null } }, { code: "MUC", name: "Munich", distance_km: 200, transit_hours: 2.75, flight_mins: { LTN: null, LHR: 130, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Ski School Gastein", price_per_hour: 72, currency: "EUR" }, { name: "Bad Gastein Ski School", price_per_hour: 82, currency: "EUR" }, { name: "Gastein Total", price_per_hour: 76, currency: "EUR" }],
    ski_pass: {day_1:50,day_3:132,day_6:235,season:840,currency:"EUR"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 230, avg_seasonal_cm: 500} },

  { id: "schladming", name: "Schladming", country: "AT", lat: 47.3919, lng: 13.6886, composite_rating: 4.3, total_lifts: 79, total_runs: 79, km_of_runs: 230, elevation_m: 1900, summit_elevation_m: 1898, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "SZG", name: "Salzburg", distance_km: 90, transit_hours: 1.5, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } },
    alt_airports: [{ code: "GRZ", name: "Graz", distance_km: 110, transit_hours: 1.75, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "VIE", name: "Vienna", distance_km: 280, transit_hours: 3.5, flight_mins: { LTN: 155, LHR: 155, LGW: 155, STN: null } }],
    ski_schools: [{ name: "Ski School Schladming", price_per_hour: 78, currency: "EUR" }, { name: "Planai Ski School", price_per_hour: 88, currency: "EUR" }, { name: "Dachstein Tauern Ski", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:880,currency:"EUR"},
    snow_data: {base_depth_cm: 50, summit_depth_cm: 200, avg_seasonal_cm: 440} },

  { id: "obertauern", name: "Obertauern", country: "AT", lat: 47.2500, lng: 13.5667, composite_rating: 4.3, total_lifts: 26, total_runs: 26, km_of_runs: 100, elevation_m: 2100, summit_elevation_m: 2347, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "SZG", name: "Salzburg", distance_km: 80, transit_hours: 1.25, flight_mins: { LTN: 135, LHR: null, LGW: 135, STN: null } },
    alt_airports: [{ code: "GRZ", name: "Graz", distance_km: 130, transit_hours: 2.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "VIE", name: "Vienna", distance_km: 290, transit_hours: 3.75, flight_mins: { LTN: 155, LHR: 155, LGW: 155, STN: null } }],
    ski_schools: [{ name: "Ski School Obertauern", price_per_hour: 78, currency: "EUR" }, { name: "Snow & Fun", price_per_hour: 88, currency: "EUR" }, { name: "Tauern Ski School", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:880,currency:"EUR"},
    snow_data: {base_depth_cm: 90, summit_depth_cm: 280, avg_seasonal_cm: 680} },

  // ── ITALY ─────────────────────────────────────────────────────────────────
  { id: "cortina", name: "Cortina d'Ampezzo", country: "IT", lat: 46.5406, lng: 12.1358, composite_rating: 4.5, total_lifts: 52, total_runs: 52, km_of_runs: 140, elevation_m: 2400, summit_elevation_m: 2930, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "VCE", name: "Venice", distance_km: 160, transit_hours: 2.25, flight_mins: { LTN: 140, LHR: null, LGW: 140, STN: 140 } },
    alt_airports: [{ code: "TSF", name: "Treviso", distance_km: 145, transit_hours: 2.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: 140 } }, { code: "INN", name: "Innsbruck", distance_km: 130, transit_hours: 2.0, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Cortina", price_per_hour: 82, currency: "EUR" }, { name: "Cortina Ski School", price_per_hour: 92, currency: "EUR" }, { name: "Azzurra Cortina", price_per_hour: 86, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:880,currency:"EUR"},
    snow_data: {base_depth_cm: 50, summit_depth_cm: 220, avg_seasonal_cm: 440} },

  { id: "cervinia", name: "Cervinia", country: "IT", lat: 45.9383, lng: 7.6308, composite_rating: 4.4, total_lifts: 52, total_runs: 52, km_of_runs: 350, elevation_m: 3000, summit_elevation_m: 3480, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "TRN", name: "Turin", distance_km: 120, transit_hours: 2.0, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } },
    alt_airports: [{ code: "GVA", name: "Geneva", distance_km: 160, transit_hours: 2.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } }, { code: "MXP", name: "Milan Malpensa", distance_km: 165, transit_hours: 2.5, flight_mins: { LTN: null, LHR: 130, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Cervinia", price_per_hour: 82, currency: "EUR" }, { name: "Cervinia Ski School", price_per_hour: 92, currency: "EUR" }, { name: "Matterhorn Ski School", price_per_hour: 88, currency: "EUR" }],
    ski_pass: {day_1:50,day_3:132,day_6:235,season:840,currency:"EUR"},
    snow_data: {base_depth_cm: 90, summit_depth_cm: 350, avg_seasonal_cm: 700} },

  { id: "madonna_campiglio", name: "Madonna di Campiglio", country: "IT", lat: 46.2333, lng: 10.8167, composite_rating: 4.4, total_lifts: 60, total_runs: 60, km_of_runs: 150, elevation_m: 2200, summit_elevation_m: 2442, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "BGY", name: "Milan Bergamo", distance_km: 165, transit_hours: 2.5, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: 130 } },
    alt_airports: [{ code: "TRN", name: "Turin", distance_km: 245, transit_hours: 3.5, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } }, { code: "VRN", name: "Verona", distance_km: 140, transit_hours: 2.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Campiglio", price_per_hour: 78, currency: "EUR" }, { name: "Madonna Ski School", price_per_hour: 88, currency: "EUR" }, { name: "Dolomiti Ski School", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:880,currency:"EUR"},
    snow_data: {base_depth_cm: 60, summit_depth_cm: 240, avg_seasonal_cm: 520} },

  { id: "val_gardena", name: "Val Gardena", country: "IT", lat: 46.5578, lng: 11.7761, composite_rating: 4.5, total_lifts: 80, total_runs: 80, km_of_runs: 175, elevation_m: 2200, summit_elevation_m: 2519, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 110, transit_hours: 1.75, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "BZO", name: "Bolzano", distance_km: 45, transit_hours: 0.75, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "VRN", name: "Verona", distance_km: 175, transit_hours: 2.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Val Gardena", price_per_hour: 78, currency: "EUR" }, { name: "Ortisei Ski School", price_per_hour: 88, currency: "EUR" }, { name: "Dolomiti Ski", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:54,day_3:142,day_6:255,season:910,currency:"EUR"},
    snow_data: {base_depth_cm: 50, summit_depth_cm: 220, avg_seasonal_cm: 460} },

  { id: "alta_badia", name: "Alta Badia", country: "IT", lat: 46.5906, lng: 11.9433, composite_rating: 4.4, total_lifts: 53, total_runs: 53, km_of_runs: 130, elevation_m: 2200, summit_elevation_m: 2778, private_per_hour: 80, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 120, transit_hours: 2.0, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "BZO", name: "Bolzano", distance_km: 60, transit_hours: 1.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "VRN", name: "Verona", distance_km: 185, transit_hours: 2.75, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Alta Badia", price_per_hour: 72, currency: "EUR" }, { name: "La Villa Ski School", price_per_hour: 82, currency: "EUR" }, { name: "Corvara Ski School", price_per_hour: 76, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:880,currency:"EUR"},
    snow_data: {base_depth_cm: 45, summit_depth_cm: 200, avg_seasonal_cm: 420} },

  { id: "selva_gardena", name: "Selva / Sella Ronda", country: "IT", lat: 46.5561, lng: 11.7600, composite_rating: 4.5, total_lifts: 175, total_runs: 175, km_of_runs: 550, elevation_m: 2200, summit_elevation_m: 2519, private_per_hour: 85, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 115, transit_hours: 1.75, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "BZO", name: "Bolzano", distance_km: 50, transit_hours: 0.75, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "VRN", name: "Verona", distance_km: 178, transit_hours: 2.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Selva", price_per_hour: 78, currency: "EUR" }, { name: "Sella Ronda Ski School", price_per_hour: 88, currency: "EUR" }, { name: "Wolkenstein Ski", price_per_hour: 82, currency: "EUR" }],
    ski_pass: {day_1:54,day_3:142,day_6:255,season:910,currency:"EUR"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 220, avg_seasonal_cm: 460} },

  { id: "livigno", name: "Livigno", country: "IT", lat: 46.5369, lng: 10.1369, composite_rating: 4.4, total_lifts: 115, total_runs: 115, km_of_runs: 115, elevation_m: 2700, summit_elevation_m: 2798, private_per_hour: 80, currency: "EUR",
    primary_airport: { code: "BGY", name: "Milan Bergamo", distance_km: 215, transit_hours: 3.0, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: 130 } },
    alt_airports: [{ code: "ZRH", name: "Zurich", distance_km: 230, transit_hours: 3.25, flight_mins: { LTN: null, LHR: 110, LGW: 110, STN: null } }, { code: "MXP", name: "Milan Malpensa", distance_km: 220, transit_hours: 3.0, flight_mins: { LTN: null, LHR: 130, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Livigno", price_per_hour: 72, currency: "EUR" }, { name: "Livigno Ski School", price_per_hour: 82, currency: "EUR" }, { name: "Azzurra Ski", price_per_hour: 76, currency: "EUR" }],
    ski_pass: {day_1:48,day_3:126,day_6:225,season:800,currency:"EUR"},
    snow_data: {base_depth_cm: 60, summit_depth_cm: 250, avg_seasonal_cm: 520} },

  { id: "sestriere", name: "Sestriere / Via Lattea", country: "IT", lat: 44.9583, lng: 6.8733, composite_rating: 4.2, total_lifts: 90, total_runs: 90, km_of_runs: 400, elevation_m: 2400, summit_elevation_m: 2823, private_per_hour: 75, currency: "EUR",
    primary_airport: { code: "TRN", name: "Turin", distance_km: 95, transit_hours: 1.5, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } },
    alt_airports: [{ code: "GNB", name: "Grenoble", distance_km: 140, transit_hours: 2.25, flight_mins: { LTN: 115, LHR: null, LGW: 115, STN: null } }, { code: "MXP", name: "Milan Malpensa", distance_km: 210, transit_hours: 3.0, flight_mins: { LTN: null, LHR: 130, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Sestriere", price_per_hour: 68, currency: "EUR" }, { name: "Via Lattea Ski School", price_per_hour: 75, currency: "EUR" }, { name: "Olympic Ski School", price_per_hour: 70, currency: "EUR" }],
    ski_pass: {day_1:46,day_3:120,day_6:215,season:770,currency:"EUR"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 220, avg_seasonal_cm: 480} },

  { id: "courmayeur", name: "Courmayeur", country: "IT", lat: 45.7933, lng: 6.9706, composite_rating: 4.4, total_lifts: 24, total_runs: 24, km_of_runs: 100, elevation_m: 2500, summit_elevation_m: 2755, private_per_hour: 90, currency: "EUR",
    primary_airport: { code: "GVA", name: "Geneva", distance_km: 100, transit_hours: 1.5, flight_mins: { LTN: 100, LHR: 100, LGW: 100, STN: 100 } },
    alt_airports: [{ code: "TRN", name: "Turin", distance_km: 145, transit_hours: 2.25, flight_mins: { LTN: 135, LHR: null, LGW: null, STN: 135 } }, { code: "MXP", name: "Milan Malpensa", distance_km: 205, transit_hours: 3.0, flight_mins: { LTN: null, LHR: 130, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Courmayeur", price_per_hour: 82, currency: "EUR" }, { name: "Monte Bianco Ski School", price_per_hour: 92, currency: "EUR" }, { name: "Courmayeur Ski Academy", price_per_hour: 86, currency: "EUR" }],
    ski_pass: {day_1:50,day_3:132,day_6:235,season:840,currency:"EUR"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 320, avg_seasonal_cm: 680} },

  { id: "kronplatz", name: "Kronplatz", country: "IT", lat: 46.7383, lng: 11.9467, composite_rating: 4.4, total_lifts: 31, total_runs: 31, km_of_runs: 119, elevation_m: 2200, summit_elevation_m: 2275, private_per_hour: 80, currency: "EUR",
    primary_airport: { code: "INN", name: "Innsbruck", distance_km: 125, transit_hours: 2.0, flight_mins: { LTN: 130, LHR: null, LGW: 130, STN: null } },
    alt_airports: [{ code: "BZO", name: "Bolzano", distance_km: 55, transit_hours: 1.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "VRN", name: "Verona", distance_km: 185, transit_hours: 2.75, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Scuola Sci Plan de Corones", price_per_hour: 72, currency: "EUR" }, { name: "Kronplatz Ski School", price_per_hour: 82, currency: "EUR" }, { name: "Pustertal Ski", price_per_hour: 76, currency: "EUR" }],
    ski_pass: {day_1:52,day_3:138,day_6:248,season:880,currency:"EUR"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 230, avg_seasonal_cm: 480} },

  // ── NORWAY ────────────────────────────────────────────────────────────────
  { id: "hemsedal", name: "Hemsedal", country: "NO", lat: 60.8628, lng: 8.5597, composite_rating: 4.2, total_lifts: 20, total_runs: 44, km_of_runs: 95, elevation_m: 1500, summit_elevation_m: 1497, private_per_hour: 950, currency: "NOK",
    primary_airport: { code: "OSL", name: "Oslo", distance_km: 220, transit_hours: 3.0, flight_mins: { LTN: 120, LHR: 120, LGW: 120, STN: 120 } },
    alt_airports: [{ code: "BGO", name: "Bergen", distance_km: 185, transit_hours: 2.75, flight_mins: { LTN: 130, LHR: 130, LGW: 130, STN: null } }, { code: "TRF", name: "Oslo Torp", distance_km: 275, transit_hours: 3.75, flight_mins: { LTN: null, LHR: null, LGW: null, STN: 125 } }],
    ski_schools: [{ name: "Hemsedal Ski School", price_per_hour: 950, currency: "NOK" }, { name: "Hemsedal Skisenter", price_per_hour: 1050, currency: "NOK" }, { name: "Nordic Ski School", price_per_hour: 990, currency: "NOK" }],
    ski_pass: {day_1:550,day_3:1350,day_6:2400,season:8500,currency:"NOK"},
    snow_data: {base_depth_cm: 60, summit_depth_cm: 260, avg_seasonal_cm: 520} },

  { id: "geilo", name: "Geilo", country: "NO", lat: 60.5333, lng: 8.2000, composite_rating: 4.0, total_lifts: 20, total_runs: 35, km_of_runs: 40, elevation_m: 1200, summit_elevation_m: 1178, private_per_hour: 900, currency: "NOK",
    primary_airport: { code: "OSL", name: "Oslo", distance_km: 240, transit_hours: 3.25, flight_mins: { LTN: 120, LHR: 120, LGW: 120, STN: 120 } },
    alt_airports: [{ code: "BGO", name: "Bergen", distance_km: 225, transit_hours: 3.0, flight_mins: { LTN: 130, LHR: 130, LGW: 130, STN: null } }, { code: "TRF", name: "Oslo Torp", distance_km: 295, transit_hours: 4.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: 125 } }],
    ski_schools: [{ name: "Geilo Ski School", price_per_hour: 900, currency: "NOK" }, { name: "Geilo Skisenter", price_per_hour: 995, currency: "NOK" }, { name: "Hallingskarvet Ski", price_per_hour: 950, currency: "NOK" }],
    ski_pass: {day_1:490,day_3:1200,day_6:2150,season:7800,currency:"NOK"},
    snow_data: {base_depth_cm: 50, summit_depth_cm: 200, avg_seasonal_cm: 400} },

  { id: "trysil", name: "Trysil", country: "NO", lat: 61.3350, lng: 12.2664, composite_rating: 4.1, total_lifts: 31, total_runs: 70, km_of_runs: 71, elevation_m: 1200, summit_elevation_m: 1132, private_per_hour: 900, currency: "NOK",
    primary_airport: { code: "OSL", name: "Oslo", distance_km: 210, transit_hours: 2.75, flight_mins: { LTN: 120, LHR: 120, LGW: 120, STN: 120 } },
    alt_airports: [{ code: "RRS", name: "Røros", distance_km: 160, transit_hours: 2.25, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "TRF", name: "Oslo Torp", distance_km: 265, transit_hours: 3.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: 125 } }],
    ski_schools: [{ name: "Trysil Ski School", price_per_hour: 900, currency: "NOK" }, { name: "Trysilfjellet Ski", price_per_hour: 995, currency: "NOK" }, { name: "Nordic Alpine", price_per_hour: 950, currency: "NOK" }],
    ski_pass: {day_1:520,day_3:1280,day_6:2280,season:8200,currency:"NOK"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 210, avg_seasonal_cm: 440} },

  { id: "voss", name: "Voss", country: "NO", lat: 60.6281, lng: 6.4178, composite_rating: 4.0, total_lifts: 18, total_runs: 40, km_of_runs: 40, elevation_m: 1000, summit_elevation_m: 945, private_per_hour: 850, currency: "NOK",
    primary_airport: { code: "BGO", name: "Bergen", distance_km: 100, transit_hours: 1.5, flight_mins: { LTN: 130, LHR: 130, LGW: 130, STN: null } },
    alt_airports: [{ code: "OSL", name: "Oslo", distance_km: 320, transit_hours: 4.5, flight_mins: { LTN: 120, LHR: 120, LGW: 120, STN: 120 } }, { code: "SVG", name: "Stavanger", distance_km: 230, transit_hours: 3.25, flight_mins: { LTN: 130, LHR: 130, LGW: 130, STN: null } }],
    ski_schools: [{ name: "Voss Ski School", price_per_hour: 850, currency: "NOK" }, { name: "Voss Resort Ski", price_per_hour: 950, currency: "NOK" }, { name: "Hardanger Ski", price_per_hour: 900, currency: "NOK" }],
    ski_pass: {day_1:480,day_3:1180,day_6:2100,season:7600,currency:"NOK"},
    snow_data: {base_depth_cm: 40, summit_depth_cm: 180, avg_seasonal_cm: 360} },

  { id: "hafjell", name: "Hafjell", country: "NO", lat: 61.2833, lng: 10.4667, composite_rating: 4.0, total_lifts: 16, total_runs: 33, km_of_runs: 34, elevation_m: 1100, summit_elevation_m: 1050, private_per_hour: 850, currency: "NOK",
    primary_airport: { code: "OSL", name: "Oslo", distance_km: 185, transit_hours: 2.5, flight_mins: { LTN: 120, LHR: 120, LGW: 120, STN: 120 } },
    alt_airports: [{ code: "TRF", name: "Oslo Torp", distance_km: 240, transit_hours: 3.25, flight_mins: { LTN: null, LHR: null, LGW: null, STN: 125 } }, { code: "RRS", name: "Røros", distance_km: 180, transit_hours: 2.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Hafjell Ski School", price_per_hour: 850, currency: "NOK" }, { name: "Hafjell Alpine Senter", price_per_hour: 950, currency: "NOK" }, { name: "Øyer Ski School", price_per_hour: 890, currency: "NOK" }],
    ski_pass: {day_1:480,day_3:1180,day_6:2100,season:7600,currency:"NOK"},
    snow_data: {base_depth_cm: 45, summit_depth_cm: 190, avg_seasonal_cm: 380} },

  // ── SWEDEN ────────────────────────────────────────────────────────────────
  { id: "are", name: "Åre", country: "SE", lat: 63.3994, lng: 13.0811, composite_rating: 4.3, total_lifts: 42, total_runs: 89, km_of_runs: 90, elevation_m: 1400, summit_elevation_m: 1274, private_per_hour: 1100, currency: "SEK",
    primary_airport: { code: "ARN", name: "Stockholm Arlanda", distance_km: 560, transit_hours: 6.5, flight_mins: { LTN: 145, LHR: 145, LGW: 145, STN: 145 } },
    alt_airports: [{ code: "OSD", name: "Östersund", distance_km: 100, transit_hours: 1.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "TRD", name: "Trondheim", distance_km: 175, transit_hours: 2.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Åre Ski School", price_per_hour: 1100, currency: "SEK" }, { name: "SkiStar Ski School", price_per_hour: 1200, currency: "SEK" }, { name: "Åre Alpine", price_per_hour: 1150, currency: "SEK" }],
    ski_pass: {day_1:520,day_3:1280,day_6:2280,season:8200,currency:"SEK"},
    snow_data: {base_depth_cm: 55, summit_depth_cm: 240, avg_seasonal_cm: 500} },

  { id: "salen", name: "Sälen", country: "SE", lat: 61.1583, lng: 13.2667, composite_rating: 4.0, total_lifts: 100, total_runs: 100, km_of_runs: 100, elevation_m: 900, summit_elevation_m: 890, private_per_hour: 1000, currency: "SEK",
    primary_airport: { code: "ARN", name: "Stockholm Arlanda", distance_km: 380, transit_hours: 5.0, flight_mins: { LTN: 145, LHR: 145, LGW: 145, STN: 145 } },
    alt_airports: [{ code: "GOT", name: "Gothenburg", distance_km: 450, transit_hours: 5.75, flight_mins: { LTN: 140, LHR: 140, LGW: 140, STN: null } }, { code: "MXX", name: "Mora", distance_km: 100, transit_hours: 1.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Sälen Ski School", price_per_hour: 1000, currency: "SEK" }, { name: "SkiStar Sälen", price_per_hour: 1100, currency: "SEK" }, { name: "Lindvallen Ski School", price_per_hour: 1050, currency: "SEK" }],
    ski_pass: {day_1:480,day_3:1180,day_6:2100,season:7600,currency:"SEK"},
    snow_data: {base_depth_cm: 40, summit_depth_cm: 160, avg_seasonal_cm: 340} },

  { id: "vemdalen", name: "Vemdalen", country: "SE", lat: 62.4500, lng: 13.8667, composite_rating: 3.9, total_lifts: 40, total_runs: 40, km_of_runs: 45, elevation_m: 1000, summit_elevation_m: 1054, private_per_hour: 950, currency: "SEK",
    primary_airport: { code: "ARN", name: "Stockholm Arlanda", distance_km: 490, transit_hours: 6.0, flight_mins: { LTN: 145, LHR: 145, LGW: 145, STN: 145 } },
    alt_airports: [{ code: "GOT", name: "Gothenburg", distance_km: 520, transit_hours: 6.5, flight_mins: { LTN: 140, LHR: 140, LGW: 140, STN: null } }, { code: "OSD", name: "Östersund", distance_km: 130, transit_hours: 2.0, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Vemdalen Ski School", price_per_hour: 950, currency: "SEK" }, { name: "SkiStar Vemdalen", price_per_hour: 1050, currency: "SEK" }, { name: "Vemdalsskalet Ski", price_per_hour: 990, currency: "SEK" }],
    ski_pass: {day_1:460,day_3:1130,day_6:2000,season:7200,currency:"SEK"},
    snow_data: {base_depth_cm: 40, summit_depth_cm: 160, avg_seasonal_cm: 320} },

  { id: "riksgransen", name: "Riksgränsen", country: "SE", lat: 68.4281, lng: 18.1278, composite_rating: 4.1, total_lifts: 12, total_runs: 17, km_of_runs: 20, elevation_m: 1200, summit_elevation_m: 909, private_per_hour: 1000, currency: "SEK",
    primary_airport: { code: "TOS", name: "Tromsø", distance_km: 130, transit_hours: 2.0, flight_mins: { LTN: null, LHR: null, LGW: 175, STN: null } },
    alt_airports: [{ code: "LLA", name: "Luleå", distance_km: 280, transit_hours: 3.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }, { code: "EVG", name: "Sveg", distance_km: 95, transit_hours: 1.5, flight_mins: { LTN: null, LHR: null, LGW: null, STN: null } }],
    ski_schools: [{ name: "Riksgränsen Ski School", price_per_hour: 1000, currency: "SEK" }, { name: "Arctic Ski School", price_per_hour: 1100, currency: "SEK" }, { name: "Abisko Ski", price_per_hour: 1050, currency: "SEK" }],
    ski_pass: {day_1:490,day_3:1200,day_6:2150,season:7800,currency:"SEK"},
    snow_data: {base_depth_cm: 80, summit_depth_cm: 380, avg_seasonal_cm: 600} },

];

// ─── Shared data types ─────────────────────────────────────────────────────────

export interface DayForecast {
  date: string;
  snowfall_cm: number;
  snow_depth_cm: number;
  precip_prob: number;
  temp_max: number;
  temp_min: number;
}

export interface ResortSnapshot {
  resort_id: string;
  resort_name: string;
  country: string;
  fetched_at: string;
  composite_rating: number;
  lifts: { total: number; open: number };
  private_instruction: { price_per_hour: number; currency: string };
  summit_snow_depth_cm?: number;
  forecast: {
    next_3_days: DayForecast[];
    following_4_days: DayForecast[];
    total_7day_snow_cm: string;
  };
}

export interface ForecastRun {
  fetched_at: string;
  resorts: ResortSnapshot[];
}

// ─── London departure airport helpers ──────────────────────────────────────────

export const LONDON_AIRPORT_PRIORITY = ["LTN", "LHR", "LGW", "STN"] as const;
export type LondonAirport = typeof LONDON_AIRPORT_PRIORITY[number];

/** Returns the best available direct departure from London for a given destination airport,
 *  respecting the user's preferred airport if it has a direct route, otherwise falling
 *  back through LTN → LHR → LGW → STN priority order. Returns null if no direct route exists. */
export function getBestDeparture(
  airport: Airport,
  preferred?: LondonAirport
): { code: LondonAirport; mins: number } | null {
  const mins = airport.flight_mins as Record<LondonAirport, number | null>;

  // Try preferred first
  if (preferred && mins[preferred] !== null && mins[preferred] !== undefined) {
    return { code: preferred, mins: mins[preferred] as number };
  }

  // Fall back through priority order
  for (const code of LONDON_AIRPORT_PRIORITY) {
    if (mins[code] !== null && mins[code] !== undefined) {
      return { code, mins: mins[code] as number };
    }
  }

  return null;
}
