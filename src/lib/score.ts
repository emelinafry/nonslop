import { DECK, pangramFor, type MediaItem } from '../data/cards';
import { archetypeFor, REASONS, type Archetype, type Reason } from '../data/archetypes';
import type { Answer } from '../screens/PlayScreen';

export interface Summary {
  correct: number;
  total: number;
  archetype: Archetype;
  /** Most-used reason and how often it was right. Null when no reason clearly dominates. */
  tell: { reason: Reason; used: number; right: number } | null;
  reasonsUsed: number;
  /** You vs Pangram on the written pieces only (Pangram reads text). */
  writing: { total: number; you: number; pangram: number; scored: number };
}

export function summarize(answers: Answer[], deck: MediaItem[] = DECK): Summary {
  const total = deck.length;
  const correct = answers.filter((a) => a.correct).length;

  const byReason = new Map<Reason, { used: number; right: number }>();
  for (const a of answers) {
    const r = byReason.get(a.reason) ?? { used: 0, right: 0 };
    r.used += 1;
    if (a.correct) r.right += 1;
    byReason.set(a.reason, r);
  }
  const ranked = [...byReason.entries()].sort((a, b) => b[1].used - a[1].used || b[1].right - a[1].right);
  const [top, second] = ranked;
  const dominant = top && (!second || top[1].used > second[1].used) && top[1].used >= 3;
  const tell = dominant ? { reason: top[0], ...top[1] } : null;

  const written = deck.filter((d) => d.kind === 'text');
  let you = 0;
  let pangram = 0;
  let scored = 0;
  for (const item of written) {
    const a = answers.find((x) => x.id === item.id);
    if (a?.correct) you += 1;
    const p = pangramFor(item);
    if (p) {
      scored += 1;
      if ((p.verdict === 'human') === item.isHuman) pangram += 1;
    }
  }

  return {
    correct,
    total,
    archetype: archetypeFor(correct, total),
    tell,
    reasonsUsed: byReason.size,
    writing: { total: written.length, you, pangram, scored },
  };
}

export function tellCopy(s: Summary): { lead: string; reason?: string; tail: string } {
  if (s.tell) {
    const { reason, used, right } = s.tell;
    if (reason === 'gut feeling') return { lead: 'You went with', reason, tail: ` ${used} times and were right ${right}.` };
    return { lead: 'You trust', reason, tail: ` — right ${right} out of ${used} times.` };
  }
  if (s.reasonsUsed >= REASONS.length - 1) return { lead: 'No single tell yet. You used', reason: 'almost every reason', tail: '. Pick a lane.' };
  return { lead: 'No single tell yet. Your reasons were', reason: 'evenly split', tail: '.' };
}
