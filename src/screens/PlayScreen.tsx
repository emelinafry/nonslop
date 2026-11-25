import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { pangramFor, type MediaItem } from '../data/cards';
import type { Reason } from '../data/archetypes';
import { PlayCard, type CardMode } from '../components/PlayCard';
import { WhySheet } from '../components/WhySheet';
import { Tally } from '../components/Tally';
import { play, tap } from '../lib/feel';

export interface Answer {
  id: string;
  guessHuman: boolean;
  reason: Reason;
  correct: boolean;
}

interface Props {
  deck: MediaItem[];
  onDone: (answers: Answer[]) => void;
  onQuit: () => void;
}

export function PlayScreen({ deck, onDone, onQuit }: Props) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<CardMode>('guess');
  const [guessHuman, setGuessHuman] = useState<boolean | null>(null);
  const [reason, setReason] = useState<Reason | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const x = useMotionValue(0);

  const item = deck[index];
  const next = deck[index + 1];
  const pangram = pangramFor(item);

  // Background wash follows the drag: vermilion to the right (human), cobalt to the left (AI).
  const humanWash = useTransform(x, [0, 160], [0, 1]);
  const aiWash = useTransform(x, [-160, 0], [1, 0]);

  useEffect(() => {
    x.set(0);
  }, [index, x]);

  function handleGuess(human: boolean) {
    setGuessHuman(human);
    setMode('why');
  }

  // The buttons get the same swish and haptic tap as a swipe.
  function handleButton(human: boolean) {
    if (mode !== 'guess') return;
    play('paper-swish');
    tap();
    handleGuess(human);
  }

  function handleReason(r: Reason) {
    setReason(r);
    const answer: Answer = { id: item.id, guessHuman: guessHuman!, reason: r, correct: guessHuman === item.isHuman };
    setAnswers((a) => [...a, answer]);
    setMode('reveal');
  }

  function handleNext() {
    setMode('leaving');
  }

  function handleLeft() {
    if (index + 1 >= deck.length) {
      onDone(answers);
      return;
    }
    // Reset before the next card mounts so it never paints at the flung-off position.
    x.set(0);
    setIndex((i) => i + 1);
    setGuessHuman(null);
    setReason(null);
    setMode('guess');
  }

  const correct = guessHuman !== null && guessHuman === item.isHuman;
  const heading = mode === 'reveal' || mode === 'leaving' ? (correct ? 'You got it.' : 'Not quite.') : 'Who made this?';
  const revealWash = mode === 'reveal' || mode === 'leaving' ? (item.isHuman ? 'human' : 'ai') : null;

  return (
    <div className="screen">
      {/* Watercolor tint behind everything */}
      <motion.div style={{ ...washStyle('228,87,46', '100% 50%'), opacity: revealWash === 'human' ? 1 : humanWash }} />
      <motion.div style={{ ...washStyle('46,75,214', '0% 50%'), opacity: revealWash === 'ai' ? 1 : aiWash }} />

      <header style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 24px 0' }}>
        <button onClick={onQuit} aria-label="Quit" style={{ width: 28, height: 28, display: 'grid', placeItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round">
            <path d="M5 5.5 L17 16.5" />
            <path d="M16.5 5 L5.5 17" />
          </svg>
        </button>
        <Tally done={index + (mode === 'reveal' || mode === 'leaving' ? 1 : 0)} total={deck.length} />
        <span className="hand" style={{ fontSize: 20, width: 40, textAlign: 'right' }}>
          {index + 1}/{deck.length}
        </span>
      </header>

      <AnimatePresence mode="wait">
        <motion.h2
          key={heading}
          className="display"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: mode === 'why' ? 0.35 : 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          style={{ position: 'relative', zIndex: 3, textAlign: 'center', fontSize: 30, lineHeight: '34px', letterSpacing: '-0.02em', marginTop: 36 }}
        >
          {heading}
        </motion.h2>
      </AnimatePresence>

      {/* Card stack */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, marginTop: 22, perspective: 1200, zIndex: 2 }}>
        {next && (
          <motion.div
            key={`next-${next.id}`}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 0.96, opacity: 1 }}
            style={{ position: 'absolute', left: 38, right: 38, top: 22, bottom: 30, rotate: 3.5, boxShadow: '0 6px 16px rgba(31,29,27,0.08)', borderRadius: 3 }}
          >
            <div className="paper-card" />
          </motion.div>
        )}
        <PlayCard
          key={item.id}
          item={item}
          mode={mode}
          x={x}
          guessHuman={guessHuman}
          pangram={pangram}
          reason={reason}
          onGuess={handleGuess}
          onLeft={handleLeft}
        />
      </div>

      <footer style={{ position: 'relative', zIndex: 3, display: 'flex', gap: 14, padding: '18px 24px 40px' }}>
        {mode === 'reveal' ? (
          <button className="pill pill--ink" style={{ flex: 1 }} onClick={handleNext}>
            {index + 1 >= deck.length ? 'See my palate' : 'Next card'}
          </button>
        ) : (
          <>
            <button
              className="pill pill--outline"
              style={{ flex: 1, color: 'var(--color-ai)', opacity: mode === 'guess' ? 1 : 0.4 }}
              disabled={mode !== 'guess'}
              onClick={() => handleButton(false)}
            >
              ← AI
            </button>
            <button
              className="pill pill--outline"
              style={{ flex: 1, color: 'var(--color-human)', opacity: mode === 'guess' ? 1 : 0.4 }}
              disabled={mode !== 'guess'}
              onClick={() => handleButton(true)}
            >
              Human →
            </button>
          </>
        )}
      </footer>

      <AnimatePresence>{mode === 'why' && guessHuman !== null && <WhySheet key="why" guessHuman={guessHuman} onPick={handleReason} />}</AnimatePresence>
    </div>
  );
}

function washStyle(rgb: string, at: string): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    background: `radial-gradient(ellipse 95% 60% at ${at}, rgba(${rgb},0.34) 0%, rgba(${rgb},0) 100%)`,
  };
}
