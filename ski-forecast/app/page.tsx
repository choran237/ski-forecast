// app/page.tsx
import { getHistory } from "@/lib/history";
import Dashboard from "./components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const history = await getHistory();
  return <Dashboard initialHistory={history} />;
}
