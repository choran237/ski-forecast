// app/resort/[id]/page.tsx
import { RESORTS } from "@/lib/resorts";
import { getHistory } from "@/lib/history";
import { notFound } from "next/navigation";
import ResortDetail from "./ResortDetail";

export const dynamic = "force-dynamic";

export default async function ResortPage({ params }: { params: { id: string } }) {
  const resort = RESORTS.find(r => r.id === params.id);
  if (!resort) notFound();

  const history = await getHistory();
  const latest = history[0];
  const snapshot = latest?.resorts.find(r => r.resort_id === params.id) ?? null;

  return <ResortDetail resort={resort} snapshot={snapshot} />;
}
