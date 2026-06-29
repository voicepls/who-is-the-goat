import { NextResponse } from "next/server";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? undefined;
  return NextResponse.json(await getScores(date));
}
