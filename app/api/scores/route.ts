import { NextResponse } from "next/server";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getScores());
}
