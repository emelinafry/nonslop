// Scores the deck with Pangram and writes src/data/pangram-scores.json.
// Run before the demo so the game never waits on the network:
//   npm run score             # written cards and photos
//   npm run score -- text     # written cards only
//   npm run score -- images   # photos only (Pangram bills per image)
// The key comes from PANGRAM_API_KEY, in .env or your shell. Never put it in src/.
//
// Text:   POST https://text.api.pangram.com/v3 { text } -> fraction_human
//         Docs: https://docs.pangram.com/api-reference/ai-detection
// Images: POST https://image.external-api.pangram.com/v1/tasks { image_b64 } -> task_id,
//         then poll GET /v1/tasks/{task_id} until stage is STAGE_SUCCESS -> ai_likelihood
//         Docs: https://docs.pangram.com/api-reference/image-detection
//
// Scoring only one kind keeps the other kind's existing scores in the file.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scoresPath = path.join(root, 'src/data/pangram-scores.json');
const key = process.env.PANGRAM_API_KEY;
if (!key) {
  console.error('Set PANGRAM_API_KEY first (see .env.example).');
  process.exit(1);
}

const only = process.argv[2];
if (only && !['text', 'images'].includes(only)) {
  console.error(`Unknown option "${only}". Use "text", "images", or nothing for both.`);
  process.exit(1);
}
const doText = only !== 'images';
const doImages = only !== 'text';

// Pull the cards out of src/data/cards.ts without a TS build step.
const source = await readFile(path.join(root, 'src/data/cards.ts'), 'utf8');

// Handles text in '...', "..." or `...` so an apostrophe in a piece doesn't drop it.
const textPattern = /id:\s*['"]([^'"]+)['"],\s*kind:\s*['"]text['"][\s\S]*?text:\s*(['"`])((?:(?!\2)[^\\]|\\.)*)\2/g;
const textCards = [...source.matchAll(textPattern)].map(([, id, , text]) => ({
  id,
  text: text.replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, '\n'),
}));
const imagePattern = /id:\s*['"]([^'"]+)['"],\s*kind:\s*['"]image['"][^}]*?src:\s*['"]([^'"]+)['"]/g;
const imageCards = [...source.matchAll(imagePattern)].map(([, id, src]) => ({ id, src }));

for (const [kind, found] of [['text', textCards], ['image', imageCards]]) {
  const expected = (source.match(new RegExp(`kind:\\s*['"]${kind}['"]`, 'g')) ?? []).length;
  if (found.length !== expected) {
    console.error(`Found ${expected} ${kind} cards in cards.ts but could only read ${found.length} of them.`);
    console.error(`Keep each ${kind} card's fields in the order id, kind, ..., ${kind === 'text' ? 'text' : 'src'}, as plain strings.`);
    process.exit(1);
  }
}

// Start from the existing scores so a text-only or image-only run keeps the rest,
// and drop scores for cards that are no longer in the deck.
let out = {};
try {
  out = JSON.parse(await readFile(scoresPath, 'utf8'));
} catch {
  /* no file yet */
}
const ids = new Set([...textCards, ...imageCards].map((c) => c.id));
for (const id of Object.keys(out)) if (!ids.has(id)) delete out[id];

let failed = 0;

if (doText) {
  for (const card of textCards) {
    const res = await fetch('https://text.api.pangram.com/v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ text: card.text }),
    });
    if (!res.ok) {
      console.error(`${card.id}: Pangram returned ${res.status} ${await res.text()}`);
      failed++;
      continue;
    }
    const data = await res.json();
    // v3 reports how much of the text is human-written as fraction_human.
    const fractionHuman = typeof data.fraction_human === 'number' ? data.fraction_human : 1 - (data.fraction_ai ?? 0);
    out[card.id] = { fractionHuman, verdict: fractionHuman >= 0.5 ? 'human' : 'ai' };
    console.log(`${card.id}: ${(fractionHuman * 100).toFixed(0)}% human`);
  }
}

if (doImages) {
  const IMAGE_API = 'https://image.external-api.pangram.com/v1/tasks';
  const AI_LABELS = new Set(['AI Detected', 'Likely AI', 'Partially AI']);

  for (const card of imageCards) {
    const file = path.join(root, 'public', card.src.replace(/^\//, ''));
    let bytes;
    try {
      bytes = await readFile(file);
    } catch {
      console.error(`${card.id}: can't read ${path.relative(root, file)}`);
      failed++;
      continue;
    }

    const submit = await fetch(IMAGE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ image_b64: bytes.toString('base64') }),
    });
    if (!submit.ok) {
      const body = await submit.text();
      const hint =
        submit.status === 401 || submit.status === 403
          ? ' (this key may not have image access; check your Pangram dashboard or ask support@pangram.com)'
          : submit.status === 402
            ? ' (not enough Pangram credits for image scoring)'
            : '';
      console.error(`${card.id}: Pangram image API returned ${submit.status} ${body}${hint}`);
      failed++;
      continue;
    }
    const { task_id } = await submit.json();

    // Poll every half second, as Pangram's own example does, for up to five minutes.
    let task;
    const deadline = Date.now() + 300_000;
    for (;;) {
      await new Promise((r) => setTimeout(r, 500));
      const res = await fetch(`${IMAGE_API}/${task_id}`, { headers: { 'x-api-key': key } });
      if (!res.ok) {
        task = { stage: 'STAGE_FAILED', error: { error: `HTTP ${res.status} ${await res.text()}` } };
        break;
      }
      task = await res.json();
      if (task.stage === 'STAGE_SUCCESS' || task.stage === 'STAGE_FAILED') break;
      if (Date.now() > deadline) {
        task = { stage: 'STAGE_FAILED', error: { error: `still running after 5 minutes (task ${task_id})` } };
        break;
      }
    }
    if (task.stage !== 'STAGE_SUCCESS') {
      console.error(`${card.id}: image scoring failed: ${task.error?.error ?? task.stage}`);
      failed++;
      continue;
    }

    // ai_likelihood is 0..1. It's null when Content Credentials decided the result instead of
    // the model; the label still says which way it went.
    const aiLikelihood = typeof task.ai_likelihood === 'number' ? task.ai_likelihood : AI_LABELS.has(task.prediction) ? 1 : 0;
    const fractionHuman = 1 - aiLikelihood;
    out[card.id] = {
      fractionHuman,
      verdict: fractionHuman >= 0.5 ? 'human' : 'ai',
      label: task.prediction,
      source: task.detection_source,
    };
    console.log(`${card.id}: ${task.prediction}, ${(aiLikelihood * 100).toFixed(0)}% AI (${task.detection_source}, ${task.confidence ?? 'n/a'} confidence)`);
  }
}

await writeFile(scoresPath, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${Object.keys(out).length} scores to src/data/pangram-scores.json`);
if (failed) {
  console.error(`${failed} card(s) could not be scored; their previous scores, if any, were kept.`);
  process.exit(1);
}
