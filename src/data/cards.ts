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
 * The deck. Nine pieces: four photos and five written pieces, all real.
 *
 * Run `npm run score` after any change to the written pieces, for fresh Pangram verdicts.
 * Video cards are still supported (kind: 'video', src: '/media/clip.mp4') if you add a clip later.
 */
export const DECK: MediaItem[] = [
  // Written pieces: text-1 and text-2 are human-written; text-3 to text-5 are AI-generated.
  {
    id: 'text-1',
    kind: 'text',
    category: 'Personal essay',
    isHuman: true,
    text: "Smiling at the audience, I took my final bow, masking my devastation behind a graceful smile as I made my way offstage.  My last six months had been a tapestry of robust rehearsals and painful pointe shoes. But despite six months of relentless practice, I had blanked on my ballet choreography mid-performance.",
  },
  {
    id: 'text-2',
    kind: 'text',
    category: 'Personal statement',
    isHuman: true,
    text: "This experience, along with the financial strain my treatment placed on my family, fundamentally shaped my perspective on the importance of quality healthcare and medical research, especially for children and families navigating complex conditions. Long term, I hope to pursue a career in biomedical research, combining computational methods with clinical and biological research to develop responsible technologies for healthcare.",
  },
  {
    id: 'text-3',
    kind: 'text',
    category: 'Program application',
    isHuman: false,
    text: "The DRIVE program offers what classes alone cannot: close mentorship, structured research training, and the opportunity to contribute meaningfully to community-engaged maternal and child health projects. Through DRIVE, I hope to strengthen my foundation as a researcher while gaining the perspective and guidance needed to build a long-term career advancing pediatric and maternal health.",
  },
  {
    id: 'text-4',
    kind: 'text',
    category: "What's a hackathon?",
    isHuman: false,
    text: "A hackathon is basically a chance to get together with people, share ideas, and build something cool. You get to learn new things, meet different people, work as a team, and sometimes even come up with ideas you never thought of before. It can get a little stressful, but the fun of creating something together and seeing your hard work pay off makes it all worth it.",
  },
  {
    id: 'text-5',
    kind: 'text',
    category: 'Student bio',
    isHuman: false,
    text: "Chey and Emelina love studying Computer Science at Stanford, where they spend countless hours coding, debugging, and tackling challenging problem sets together. They especially enjoy working with classmates, eating at Arrillaga late-night dining, and hopping on Caltrain for spontaneous adventures, exploring everything the Bay Area has to offer!",
  },
  // Real media: bread, selfie and sunset are AI (ChatGPT credentials on the first two); the garden is a phone photo.
  { id: 'image-1', kind: 'image', category: 'Photo', isHuman: false, src: '/media/image-1.jpg' },
  // TODO: add an author line for the garden photo, e.g. author: 'Cheyoung, last summer'.
  { id: 'image-2', kind: 'image', category: 'Photo', isHuman: true, src: '/media/image-2.jpg' },
  { id: 'image-3', kind: 'image', category: 'Photo', isHuman: false, src: '/media/image-3.jpg' },
  { id: 'image-4', kind: 'image', category: 'Photo', isHuman: false, src: '/media/image-4.jpg' },
];

const scores = pangramScores as Record<string, PangramResult>;

/** Pangram's verdict for a card, from `npm run score`. Null for cards it hasn't scored (e.g. video). */
export function pangramFor(item: MediaItem): PangramResult | null {
  const s = scores[item.id];
  if (!s) return null;
  // Verdict is defined by the score, so a hand-edited JSON can't disagree with itself.
  return { fractionHuman: s.fractionHuman, verdict: s.fractionHuman >= 0.5 ? 'human' : 'ai' };
}
