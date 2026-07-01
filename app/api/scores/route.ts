import { NextResponse } from "next/server";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? undefined;
  const scores = await getScores(date);
  const response = NextResponse.json(scores);
  // Cache the scores at the Edge CDN for 60 seconds to reduce Neon DB load
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");
  return response;
}
