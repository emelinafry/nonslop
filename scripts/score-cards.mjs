// Scores every written card with Pangram and writes src/data/pangram-scores.json.
// Run before the demo so the game never waits on the network:
//   PANGRAM_API_KEY=... npm run score
//
// API: POST https://text.api.pangram.com/v3 with header x-api-key and body { text }.
// Docs: https://docs.pangram.com/api-reference/ai-detection

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const key = process.env.PANGRAM_API_KEY;
if (!key) {
  console.error('Set PANGRAM_API_KEY first (see .env.example).');
  process.exit(1);
}

// Pull the written cards out of src/data/cards.ts without a TS build step.
const source = await readFile(path.join(root, 'src/data/cards.ts'), 'utf8');
// Handles text in '...', "..." or `...` so an apostrophe in a piece doesn't drop it.
const cardPattern = /id:\s*['"]([^'"]+)['"],\s*kind:\s*['"]text['"][\s\S]*?text:\s*(['"`])((?:(?!\2)[^\\]|\\.)*)\2/g;
const cards = [...source.matchAll(cardPattern)].map(([, id, , text]) => ({
  id,
  text: text.replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, '\n'),
}));

const expected = (source.match(/kind:\s*['"]text['"]/g) ?? []).length;
if (cards.length !== expected) {
  console.error(`Found ${expected} written cards in cards.ts but could only read the text of ${cards.length}.`);
  console.error("Keep each written card's fields in the order id, kind, ..., text, with the text as a plain string.");
  process.exit(1);
}

const out = {};
for (const card of cards) {
  const res = await fetch('https://text.api.pangram.com/v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
    body: JSON.stringify({ text: card.text }),
  });
  if (!res.ok) {
    console.error(`${card.id}: Pangram returned ${res.status} ${await res.text()}`);
    continue;
  }
  const data = await res.json();
  // v3 reports how much of the text is human-written as fraction_human.
  const fractionHuman = typeof data.fraction_human === 'number' ? data.fraction_human : 1 - (data.fraction_ai ?? 0);
  out[card.id] = { fractionHuman, verdict: fractionHuman >= 0.5 ? 'human' : 'ai' };
  console.log(`${card.id}: ${(fractionHuman * 100).toFixed(0)}% human`);
}

await writeFile(path.join(root, 'src/data/pangram-scores.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${Object.keys(out).length} scores to src/data/pangram-scores.json`);
