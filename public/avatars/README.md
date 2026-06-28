# Image avatars (optional)

By default the app uses hand-drawn animated SVG avatars whose faces morph (smile,
frown, tears) with the vote. You can swap in illustration files (PNG or SVG)
instead — e.g. the 3D characters from Flaticon.

1. Save your files here, for example:
   - `ronaldo.png`, `ronaldo-sad.png`
   - `messi.png`, `messi-sad.png`
2. Point `.env.local` at them:
   ```
   NEXT_PUBLIC_RON_AVATAR=/avatars/ronaldo.png
   NEXT_PUBLIC_RON_AVATAR_SAD=/avatars/ronaldo-sad.png
   NEXT_PUBLIC_MES_AVATAR=/avatars/messi.png
   NEXT_PUBLIC_MES_AVATAR_SAD=/avatars/messi-sad.png
   ```
3. Restart `npm run dev`.

## How "crying" works with a flat image
A single illustration can't morph its face. The app instead layers the emotion:
whole-body motion (bob / tremble / slump / celebrate / spin), falling teardrops
over the eyes, and a desaturate + dim filter as the deficit grows. If you provide
a `*_SAD` image, it **crossfades** happy → sad on mood for a real facial change.
The `*_SAD` variant is optional; without it the filter is used.

## Licensing
The Flaticon "Cristiano ronaldo avatar" by KOKOTA is **CC BY 4.0** — you must
credit the author/Flaticon visibly (e.g. in a footer or about page) if you use it.
```
