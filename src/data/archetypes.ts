export type ArchetypeId = 'romantic' | 'skimmer' | 'coinflip' | 'editor' | 'sommelier';

export const REASONS = ['too polished', 'too specific', 'weird detail', 'sounds like a person', 'gut feeling'] as const;
export type Reason = (typeof REASONS)[number];

export interface Archetype {
  id: ArchetypeId;
  name: string;
  /** Share of correct guesses this archetype covers, upper bound inclusive. */
  maxScore: number;
  color: string;
  oneLiner: string;
  /** Mesh gradient colors: deep wash, pale wash, accent, then paper twice to keep the top light. */
  mesh: string[];
}

const PAPER = '#F4F3F1';

export const ARCHETYPES: Archetype[] = [
  {
    id: 'romantic',
    name: 'Romantic',
    maxScore: 0.2,
    color: '#2E4BD6',
    oneLiner: 'you see a soul in everything.\neven the bots.',
    mesh: ['#2E4BD6', '#8FA4EC', '#F2A3B8', PAPER, PAPER],
  },
  {
    id: 'skimmer',
    name: 'Skimmer',
    maxScore: 0.4,
    color: '#6A55C8',
    oneLiner: 'you read for vibes,\nnot tells.',
    mesh: ['#6A55C8', '#B3A8E6', '#2E4BD6', PAPER, PAPER],
  },
  {
    id: 'coinflip',
    name: 'Coin Flip',
    maxScore: 0.6,
    color: '#A04FAE',
    oneLiner: 'statistically a guess.\nspiritually undecided.',
    mesh: ['#A04FAE', '#D9B2DF', '#CF4E78', PAPER, PAPER],
  },
  {
    id: 'editor',
    name: 'Editor',
    maxScore: 0.8,
    color: '#CF4E78',
    oneLiner: 'you notice when something\nis too clean.',
    mesh: ['#CF4E78', '#F2B8C9', '#E4572E', PAPER, PAPER],
  },
  {
    id: 'sommelier',
    name: 'Sommelier',
    maxScore: 1,
    color: '#E4572E',
    oneLiner: 'you can taste the difference.\nPangram should be nervous.',
    mesh: ['#E4572E', '#F6B595', '#F2967E', PAPER, PAPER],
  },
];

export function archetypeFor(correct: number, total: number): Archetype {
  const share = total === 0 ? 0 : correct / total;
  return ARCHETYPES.find((a) => share <= a.maxScore + 1e-9) ?? ARCHETYPES[ARCHETYPES.length - 1];
}
