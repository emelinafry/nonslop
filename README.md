# Hot or Slop

A swipe game for the Non-Slop Hackathon. Nine pieces (four photos and five pieces of writing) come up one at a time, and you swipe right if a human made it and left if AI did. After each guess you say *why*. At the end you get one of five archetypes, each with its own pixel capybara, plus how you did against Pangram, the AI detector, on the same cards.

Built with React, Vite, Framer Motion, and [Paper Shaders](https://shaders.paper.design) (`@paper-design/shaders-react`) for the watercolor mesh on the result screen. The visual design comes from the Paper file.

## Run it

```bash
npm install
npm run dev
```

Open the local URL in a narrow browser window. Arrow keys work for swiping on a laptop.

**On your phone:** run `npm run dev:phone` (that's `vite --host`) on a laptop that's on the same wifi as the phone, then open the `Network:` URL it prints, e.g. `http://192.168.1.20:5173`. Some campus and hackathon networks block phone-to-laptop traffic. If the page won't load, use a phone hotspot instead.

Over plain `http://` on wifi the browser turns off the native share sheet, so Share copies the result text instead and the button says "Copied". On `localhost` or a deployed `https://` URL, Share opens the share sheet.

## Before the demo

1. **Media.** The four photos are in `public/media/image-1.jpg` to `image-4.jpg`. To add more, including video clips (`kind: 'video'`), put the files in `public/media/` and add a card in `src/data/cards.ts`. Strip metadata from new media before committing: AI images often carry Content Credentials that name the generator, which would give the answer away to anyone who downloads the file from this public repo.
2. **Writing.** The five written pieces in `src/data/cards.ts` are real: two human-written and three AI-generated. To change them, edit the `text` and set `isHuman` (and `author` for human pieces), then rescore. Card text shrinks to fit, so a full paragraph works.
3. **Score the deck with Pangram.** Written cards go to Pangram's text API and photos to its image API. Images are billed per image, so `npm run score -- text` rescores just the writing and `npm run score -- images` just the photos. A partial run keeps the other scores.
   ```bash
   cp .env.example .env   # then put your key in .env
   npm run score
   ```
   `npm run score` reads the key from `.env`, or from `PANGRAM_API_KEY` in your shell. `.env` is git-ignored, so never commit the key or put it in `src/`. The script writes `src/data/pangram-scores.json`, so the game never waits on the network during the demo. Rerun it whenever you change a card. Photos are scored from the metadata-stripped copies in `public/media`, so Pangram judges the pixels, not Content Credentials. If it can't read every written card's text, it stops and tells you instead of skipping one.
4. **Optional sound.** Drop short files at `public/sfx/paper-swish.mp3` and `public/sfx/stamp.mp3`. Record real paper.

## How scoring works

| Correct | Archetype |
|---|---|
| 0–20% | The Romantic |
| 21–40% | The Skimmer |
| 41–60% | The Coin Flip |
| 61–80% | The Editor |
| 81–100% | The Sommelier |

"Your tell" is the reason you picked most often (at least 3 times) and how often it was right.

## Where things live

- `src/screens/` holds the start, play, calculating, and result screens.
- `src/components/PlayCard.tsx` is the swipe card: bottom pivot, 3D tilt, sliding light, stamps, spring release, and the flip reveal.
- `src/components/ArchetypeBackground.tsx` is the Paper Shaders mesh, with the paper texture multiplied over it.
- `src/components/Capybara.tsx` and `src/data/capybaras.ts` hold the pixel capybaras: one shared base plus an accessory layer per archetype.
- `src/data/archetypes.ts` has archetype names, colors, mesh palettes, and score bands.
