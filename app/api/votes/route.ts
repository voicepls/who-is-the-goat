import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isPlayerKey, MAX_AMOUNT_PER_REQUEST, type PlayerKey } from "@/lib/players";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Totals = Record<PlayerKey, number>;

async function readTotals(): Promise<Totals> {
  if (!sql) {
    return { ron: 0, mes: 0 };
  }

  await ensureSchema();
  const rows = (await sql`select player, count from vote_totals`) as {
    player: PlayerKey;
    count: number | string;
  }[];

  const totals: Totals = { ron: 0, mes: 0 };
  for (const row of rows) {
    if (isPlayerKey(row.player)) {
      totals[row.player] = Number(row.count);
    }
  }
  return totals;
}

export async function GET() {
  try {
    const totals = await readTotals();
    return NextResponse.json({ enabled: Boolean(sql), totals });
  } catch (error) {
    console.error("GET /api/votes failed", error);
    return NextResponse.json({ enabled: false, totals: { ron: 0, mes: 0 } });
  }
}

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ enabled: false, totals: { ron: 0, mes: 0 } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { player, amount } = (body ?? {}) as { player?: unknown; amount?: unknown };

  if (!isPlayerKey(player)) {
    return NextResponse.json({ error: "player must be 'ron' or 'mes'" }, { status: 400 });
  }

  const rawAmount = typeof amount === "number" ? Math.floor(amount) : 1;
  const safeAmount = Math.max(1, Math.min(rawAmount, MAX_AMOUNT_PER_REQUEST));

  try {
    await ensureSchema();
    await sql`
      update vote_totals
      set count = count + ${safeAmount}
      where player = ${player}
    `;

    const totals = await readTotals();
    return NextResponse.json({ enabled: true, totals });
  } catch (error) {
    console.error("POST /api/votes failed", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
