# Who is the GOAT?

A playful live voting arena for the eternal Ronaldo vs Messi debate, themed around FIFA World Cup 2026.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Copy `.env.example` to `.env.local` and add your keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SPORTSDATA_KEY=...
```

If Supabase or SportsData keys are missing, the app still runs with seeded vote totals and mock World Cup scores.

## Supabase table

```sql
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  player text not null check (player in ('ron', 'mes')),
  created_at timestamptz not null default now()
);

alter table public.votes enable row level security;

create policy "Allow anonymous vote inserts"
on public.votes
for insert
to anon
with check (player in ('ron', 'mes'));

create policy "Allow anonymous vote counts"
on public.votes
for select
to anon
using (true);
```

Enable Realtime for the `votes` table in your Supabase project so live counts update across browsers.
