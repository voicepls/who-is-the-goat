# Who is the GOAT?

A playful live voting arena for the eternal Ronaldo vs Messi debate, themed around FIFA World Cup 2026. Visitors can vote as many times as they want — the loser visibly slumps, trembles, and cries harder the further behind they fall.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The app runs with **zero configuration** — no database or API keys required. Without them you get seeded vote totals (counted locally) and sample World Cup scores. Add the keys below to go fully live.

## Environment

Copy `.env.example` to `.env.local` and fill in what you need:

```bash
DATABASE_URL=                     # Neon Postgres - enables shared, persisted live voting
VOTE_RESET_TOKEN=                 # optional, protects production vote resets
SPORTSDATA_API_KEY=               # optional primary live score API - SportsData.io GamesByDate
THESPORTSDB_KEY=                  # optional, defaults to free public key "3"
NEXT_PUBLIC_ADSENSE_CLIENT=       # optional, ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=  # optional, sticky banner ad slot id
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR= # optional, sidebar ad slot id
```

## Voting & the database (Neon)

- **Unlimited hype-clicking.** Every tap is `+1`. A light client cooldown keeps accidental double-fires under control while still letting fans spam votes.
- **Optimistic batched writes.** The selected player increments immediately in the UI, then syncs to Neon with a small idle debounce so the page feels instant and avoids one DB write per tap.
- **Concurrency-safe counts.** Each write is an atomic `UPDATE … SET count = count + n` on a single row, which Postgres serialises with a row lock. Many users writing at once each apply their delta with no lost updates (verified: 40 concurrent writes → exactly +40).
- **Live across browsers.** Clients optimistically show their own taps instantly and poll `/api/votes` every ~2.5s to pull in everyone else's.
- **Going further.** For truly extreme write volume, batch server-side too: buffer deltas in memory or Redis and flush to Postgres on an interval. The client contract (`POST /api/votes { player, amount }`) stays the same.

Set `DATABASE_URL` to your Neon connection string (use the **pooled** connection). The `vote_totals` table is created and seeded automatically on first request — no migration step needed. If you'd rather create it by hand:

```sql
create table if not exists vote_totals (
  player text primary key check (player in ('ron', 'mes')),
  count bigint not null default 0
);

insert into vote_totals (player, count)
values ('ron', 0), ('mes', 0)
on conflict (player) do nothing;
```

Without `DATABASE_URL` the app falls back to local-only counting (your votes, this browser).
To reset live Neon totals back to `0 - 0`, call `DELETE /api/votes`. In production, set
`VOTE_RESET_TOKEN` and send it as `Authorization: Bearer <token>`.

## Live World Cup scores

`/api/scores?date=YYYY-MM-DD` fetches soccer fixtures server-side for the browser's current day. It prefers SportsData.io's `GamesByDate` endpoint when `SPORTSDATA_API_KEY` is set, then falls back to [TheSportsDB](https://www.thesportsdb.com/) (free public key `3`). The sidebar refreshes every 60 seconds and shows LIVE, FT, or Upcoming states. If both upstream calls fail, it falls back to sample games.

## Player stats

Career numbers in the stats panel are hardcoded from the project brief: club goals, international goals, Ballon d'Ors, World Cup titles, and estimated 2024 earnings.

## Sounds

Voting plays the meme MP3 clips in `public/sounds/ron.mp3` and
`public/sounds/mes.mp3`. If either file is missing, the app falls back to a
short synthesized sound. A 🔊/🔇 toggle in the header mutes everything (remembered per browser).
Playback is throttled so rapid mashing never machine-guns the audio.

## Avatars

The player cards use the supplied image ladders in `public/avatars/ronaldo/` and
`public/avatars/messi/`: `happy-20/40/60/80/100` and `sad-20/40/60/80/100`.
When the vote is close, both players show `happy-20`. Once a player leads, the
leader's percentage picks the intensity: a 60% Ronaldo lead shows Ronaldo's
`happy-60` and Messi's `sad-60`.

## SEO

The site is built to be discoverable, especially for live-score and GOAT-debate searches:

- Rich metadata (title template, description, keywords, Open Graph, Twitter card, canonical, robots) in `app/layout.tsx`.
- Server-rendered JSON-LD in `app/JsonLd.tsx`: a `WebPage`/`Question` block plus an `ItemList` of `SportsEvent`s built from the same live scores (`lib/scores.ts`), revalidated every 60s — so today's matches appear in structured data with no client JS.
- `app/robots.ts` and `app/sitemap.ts` generate `/robots.txt` and `/sitemap.xml`.

Set `NEXT_PUBLIC_SITE_URL` to your real domain in production (it's the canonical origin used in metadata, robots, sitemap, and JSON-LD). Optionally set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and add an `og-image.png` to `public/`.

## Ads

Ad units are AdSense-ready. With `NEXT_PUBLIC_ADSENSE_CLIENT` (and slot ids) set, real ads render via a dismissible sticky bottom banner and a sidebar unit. Without them, clearly-labelled placeholders keep the layout intact. The banner is intentionally slim and dismissible so it raises visibility without blocking the arena.
