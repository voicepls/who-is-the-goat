# Who is the GOAT?

A playful live voting arena for the eternal Ronaldo vs Messi debate, themed around FIFA World Cup 2026. Tap as many times as you like to hype your player — the loser visibly slumps, trembles, and cries harder the further behind they fall.

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
DATABASE_URL=                     # Neon Postgres — enables shared, persisted live voting
THESPORTSDB_KEY=                  # optional, defaults to free public key "3"
NEXT_PUBLIC_ADSENSE_CLIENT=       # optional, ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=  # optional, sticky banner ad slot id
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR= # optional, sidebar ad slot id
```

## Voting & the database (Neon)

- **Unlimited hype-clicking.** Every tap is `+1`. A light client cooldown (~14 clicks/sec) curbs auto-fire and the API caps each request at 1000.
- **No DB call per click (scales to mashing).** Clicks increment the UI instantly and accumulate locally. The write is **idle-debounced**: it only fires ~1.8s after you *stop* clicking, so a 1000-click burst becomes **one** `UPDATE`. A hard ceiling (`FLUSH_MAX_WAIT_MS`, 8s) forces a sync during non-stop mashing so others still see progress. Net effect: roughly one DB write per user per burst, not per click.
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
values ('ron', 5420), ('mes', 4890)
on conflict (player) do nothing;
```

Without `DATABASE_URL` the app falls back to local-only counting (your votes, this browser).

## Live World Cup scores

`/api/scores` fetches soccer fixtures server-side from [TheSportsDB](https://www.thesportsdb.com/) (free public key `3`). It looks back over the last few days and always surfaces the most recent **finished results with real scores** first, then live games, then upcoming fixtures (with kickoff times) — World Cup matches prioritized — so the panel is never empty even when today's games haven't kicked off. Falls back to sample games if the upstream request fails. Set `THESPORTSDB_KEY` to use your own key.

## Player stats

Career numbers in the stats panel are hardcoded all-time totals as of the 2026 World Cup (not live). Sources: [messivsronaldo.app](https://www.messivsronaldo.app/) and [messixronaldo.com](https://messixronaldo.com/).

## Sounds

Voting plays a short sound — a triumphant arpeggio synthesized in the browser, so
**audio works with no files**. To use real clips (e.g. a "SUIII" for Ronaldo),
drop `ron.mp3` / `mes.mp3` into `public/sounds/` — they override the synth
automatically. A 🔊/🔇 toggle in the header mutes everything (remembered per browser).
Playback is throttled so rapid mashing never machine-guns the audio.

## Avatars

By default the avatars are hand-drawn animated SVGs whose faces morph with the vote.
To use illustration files instead (PNG/SVG, e.g. from Flaticon), drop them in
`public/avatars/` and set `NEXT_PUBLIC_RON_AVATAR` / `NEXT_PUBLIC_MES_AVATAR` (with
optional `*_SAD` variants to crossfade faces). See [public/avatars/README.md](public/avatars/README.md)
for details and licensing notes. With a flat image, "crying" is layered on as
body motion + teardrops + a sad filter rather than facial morphing.

## SEO

The site is built to be discoverable, especially for live-score and GOAT-debate searches:

- Rich metadata (title template, description, keywords, Open Graph, Twitter card, canonical, robots) in `app/layout.tsx`.
- Server-rendered JSON-LD in `app/JsonLd.tsx`: a `WebPage`/`Question` block plus an `ItemList` of `SportsEvent`s built from the same live scores (`lib/scores.ts`), revalidated every 60s — so today's matches appear in structured data with no client JS.
- `app/robots.ts` and `app/sitemap.ts` generate `/robots.txt` and `/sitemap.xml`.

Set `NEXT_PUBLIC_SITE_URL` to your real domain in production (it's the canonical origin used in metadata, robots, sitemap, and JSON-LD). Optionally set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and add an `og-image.png` to `public/`.

## Ads

Ad units are AdSense-ready. With `NEXT_PUBLIC_ADSENSE_CLIENT` (and slot ids) set, real ads render via a dismissible sticky bottom banner and a sidebar unit. Without them, clearly-labelled placeholders keep the layout intact. The banner is intentionally slim and dismissible so it raises visibility without blocking the arena.
