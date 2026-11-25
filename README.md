# Hot or Slop

A swipe game for the Non-Slop Hackathon. Ten pieces (photos, clips, and writing) come up one at a time, and you swipe right if a human made it and left if AI did. After each guess you say *why*. At the end you get one of five archetypes, each with its own pixel capybara, plus how you did against Pangram on the writing.

Built with React, Vite, Framer Motion, and [Paper Shaders](https://shaders.paper.design) (`@paper-design/shaders-react`) for the watercolor mesh on the result screen. The visual design comes from the Paper file.

## Run it

```bash
npm install
npm run dev
```

Open the local URL on your phone (same wifi) or in a narrow browser window. Arrow keys work for swiping on a laptop.

## Before the demo

1. **Add the media.** Put three photos and three clips in `public/media/` named `image-1.jpg` to `image-3.jpg` and `video-1.mp4` to `video-3.mp4`, or point `src` in `src/data/cards.ts` at your own files. Until then those cards show a dashed placeholder.
2. **Replace the placeholder writing.** The four written pieces in `src/data/cards.ts` are stand-ins. Swap in pieces people in the room actually wrote, and AI pieces generated from the same prompts. Set `isHuman` and `author` for each.
3. **Score the writing with Pangram.** Pangram reads text only, so only written cards get a score.
   ```bash
   cp .env.example .env   # add your key
   PANGRAM_API_KEY=... npm run score
   ```
   This writes `src/data/pangram-scores.json`, so the game never waits on the network during the demo.
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
