# Sound effects

The app references these two files directly:

- `public/sounds/ron.mp3` — plays when **Ronaldo** is voted (e.g. a "SUIIII" clip)
- `public/sounds/mes.mp3` — plays when **Messi** is voted (e.g. a cheer / "vamos")

Just drop the files in this folder with those exact names. They are picked up
automatically once they load — no env vars, no code changes.

Until the files exist, voting falls back to a short synthesized tone, so sound
always works. Use clips you have the rights to; keep them short (< 2s) and small.
