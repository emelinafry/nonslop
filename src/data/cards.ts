import pangramScores from './pangram-scores.json';

export type MediaKind = 'image' | 'video' | 'text';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  /** Small label on the card, e.g. "Text to a friend". */
  category: string;
  /** Ground truth: who actually made it. */
  isHuman: boolean;
  /** Shown on the reveal for human-made pieces, e.g. "Maya, 40 min ago". */
  author?: string;
  /** For text cards. */
  text?: string;
  /** For image/video cards: a path under /public, e.g. "/media/image-1.jpg". */
  src?: string;
}

export interface PangramResult {
  /** 0..1, share of the text Pangram thinks a human wrote. */
  fractionHuman: number;
  verdict: 'human' | 'ai';
}

/**
 * The deck. Ten pieces: three images, three videos, four written pieces.
 *
 * Everything below is PLACEHOLDER content so the game runs end to end.
 * Before the demo:
 *   1. Drop real images/videos into /public/media with these file names (or change `src`).
 *   2. Replace the human-written text with pieces people in the room actually wrote,
 *      and the AI text with pieces you generated from the same prompts.
 *   3. Run `npm run score` to get real Pangram verdicts for the written pieces.
 */
export const DECK: MediaItem[] = [
  {
    id: 'text-1',
    kind: 'text',
    category: 'Dating bio',
    isHuman: true,
    author: 'Maya, 40 min ago',
    text: 'I will remember your coffee order and forget my own birthday.',
  },
  { id: 'image-1', kind: 'image', category: 'Photo', isHuman: false, src: '/media/image-1.jpg' },
  { id: 'video-1', kind: 'video', category: 'Clip', isHuman: true, author: 'Dev, this morning', src: '/media/video-1.mp4' },
  {
    id: 'text-2',
    kind: 'text',
    category: 'Text to a friend',
    isHuman: false,
    text: 'omg I literally just saw a dog wearing tiny rain boots and thought of you. hope your day is going amazing!!',
  },
  { id: 'image-2', kind: 'image', category: 'Photo', isHuman: true, author: 'Priya, last week', src: '/media/image-2.jpg' },
  { id: 'video-2', kind: 'video', category: 'Clip', isHuman: false, src: '/media/video-2.mp4' },
  {
    id: 'text-3',
    kind: 'text',
    category: 'Describe this room',
    isHuman: true,
    author: 'Sam, 20 min ago',
    text: 'Forty laptops, one working outlet, and somebody is microwaving fish.',
  },
  { id: 'image-3', kind: 'image', category: 'Photo', isHuman: false, src: '/media/image-3.jpg' },
  { id: 'video-3', kind: 'video', category: 'Clip', isHuman: true, author: 'Jordan, yesterday', src: '/media/video-3.mp4' },
  {
    id: 'text-4',
    kind: 'text',
    category: 'Describe this room',
    isHuman: false,
    text: 'A vibrant space buzzing with creativity, where passionate builders come together to shape the future.',
  },
];

const scores = pangramScores as Record<string, PangramResult>;

/** Pangram only reads text, so image and video cards return null. */
export function pangramFor(item: MediaItem): PangramResult | null {
  if (item.kind !== 'text') return null;
  const s = scores[item.id];
  if (!s) return null;
  // Verdict is defined by the score, so a hand-edited JSON can't disagree with itself.
  return { fractionHuman: s.fractionHuman, verdict: s.fractionHuman >= 0.5 ? 'human' : 'ai' };
}
