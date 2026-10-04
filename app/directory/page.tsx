import { listAgents, trendingScore, type StoreAgent } from "@/lib/store";
import DirectoryClient from "./DirectoryClient";

export const dynamic = "force-dynamic";

function top(list: StoreAgent[], n: number, by: (a: StoreAgent, b: StoreAgent) => number) {
  return [...list].sort(by).slice(0, n);
}

export default async function DirectoryPage() {
  const agents = await listAgents();

  const boards = {
    rented: top(agents, 5, (a, b) => b.runCount - a.runCount),
    rated: top(agents, 5, (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount),
    trending: top(agents, 5, (a, b) => trendingScore(b) - trendingScore(a)),
  };

  return <DirectoryClient agents={agents} boards={boards} />;
}
