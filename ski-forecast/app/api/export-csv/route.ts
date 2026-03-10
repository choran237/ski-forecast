// app/api/export-csv/route.ts
import { NextResponse } from "next/server";
import { getHistory } from "@/lib/history";

export const dynamic = "force-dynamic";

export async function GET() {
  const history = await getHistory();
  const latest = history[0];

  if (!latest) {
    return NextResponse.json({ error: "No data yet" }, { status: 404 });
  }

  const rows = [
    ["Resort","Country","Rating","Total Lifts","Open Lifts","Private/hr","Currency",
     "D1 Snow(cm)","D2 Snow(cm)","D3 Snow(cm)","D4 Snow(cm)","D5 Snow(cm)","D6 Snow(cm)","D7 Snow(cm)",
     "7-Day Total(cm)","Fetched At"],
  ];

  for (const r of latest.resorts) {
    const days = [...r.forecast.next_3_days, ...r.forecast.following_4_days];
    rows.push([
      r.resort_name, r.country,
      String(r.composite_rating),
      String(r.lifts.total), String(r.lifts.open),
      String(r.private_instruction.price_per_hour), r.private_instruction.currency,
      ...days.map(d => String(d.snowfall_cm)),
      r.forecast.total_7day_snow_cm,
      r.fetched_at,
    ]);
  }

  const csv = rows.map(r => r.join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="ski-forecast-${latest.fetched_at.slice(0,10)}.csv"`,
    },
  });
}
