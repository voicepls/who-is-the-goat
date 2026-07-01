import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Edges = {
  node: {
    competition: string;
    goals: string;
    apps: string;
  };
}[];

const DEFAULT_STATS = [
  { label: "Club goals", ron: 830, mes: 794 },
  { label: "International goals", ron: 145, mes: 123 },
  { label: "Ballon d'Or", ron: 5, mes: 8 },
  { label: "World Cup titles", ron: 0, mes: 1 },
  { label: "Estimated 2024 earnings", ron: 260, mes: 150, prefix: "$", suffix: "M" },
];

let cachedStats: typeof DEFAULT_STATS | null = null;
let lastFetch = 0;
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours cache

export async function GET() {
  const now = Date.now();
  let stats = cachedStats;

  if (stats && now - lastFetch < CACHE_MS) {
    const response = NextResponse.json({ stats });
    response.headers.set("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=43200");
    return response;
  }

  try {
    const res = await fetch("https://www.messivsronaldo.app/page-data/index/page-data.json", {
      headers: {
        "User-Agent": "GOATVoteRedesign/1.0 (contact@goatvote.com)"
      },
      next: { revalidate: 21600 } // 6 hours cache in Next.js
    });
    if (!res.ok) throw new Error("failed to fetch messivsronaldo.app");
    
    const payload = await res.json();
    const data = payload.result.data;

    const ronEdges = (data.allSheetRonaldoAllTimeStats?.edges || []) as Edges;
    const mesEdges = (data.allSheetMessiAllTimeStats?.edges || []) as Edges;

    const ronClub = ronEdges.find(e => e.node.competition === "All Time Club");
    const ronInt = ronEdges.find(e => e.node.competition === "All Time Internationals");

    const mesClub = mesEdges.find(e => e.node.competition === "All Time Club");
    const mesInt = mesEdges.find(e => e.node.competition === "All Time Internationals");

    stats = [
      { 
        label: "Club goals", 
        ron: ronClub ? parseInt(ronClub.node.goals) : 830, 
        mes: mesClub ? parseInt(mesClub.node.goals) : 794 
      },
      { 
        label: "International goals", 
        ron: ronInt ? parseInt(ronInt.node.goals) : 145, 
        mes: mesInt ? parseInt(mesInt.node.goals) : 123 
      },
      { label: "Ballon d'Or", ron: 5, mes: 8 },
      { label: "World Cup titles", ron: 0, mes: 1 },
      { label: "Estimated 2024 earnings", ron: 260, mes: 150, prefix: "$", suffix: "M" },
    ];

    cachedStats = stats;
    lastFetch = now;
  } catch (error) {
    console.error("GET /api/career-stats failed, serving fallback:", error);
    stats = cachedStats || DEFAULT_STATS;
  }

  const response = NextResponse.json({ stats });
  // Cache for 6 hours on Edge CDN
  response.headers.set("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=43200");
  return response;
}
