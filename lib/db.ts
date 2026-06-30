import { neon } from "@neondatabase/serverless";
import { SEED_COUNTS } from "@/lib/players";

const databaseUrl = process.env.DATABASE_URL;

export const sql = databaseUrl ? neon(databaseUrl) : null;

let ensured: Promise<void> | null = null;

export async function ensureSchema() {
  if (!sql) return;

  if (!ensured) {
    ensured = (async () => {
      await sql`
        create table if not exists vote_totals (
          player text primary key check (player in ('ron', 'mes')),
          count bigint not null default 0
        )
      `;
      await sql`
        insert into vote_totals (player, count)
        values ('ron', ${SEED_COUNTS.ron}), ('mes', ${SEED_COUNTS.mes})
        on conflict (player) do nothing
      `;
      await sql`
        create table if not exists scores_cache (
          cache_key text primary key,
          payload text not null,
          updated_at timestamp with time zone not null default now()
        )
      `;
    })().catch((error) => {
      ensured = null;
      throw error;
    });
  }

  return ensured;
}
