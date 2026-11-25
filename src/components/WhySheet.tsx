import { useState } from 'react';
import { motion } from 'framer-motion';
import { REASONS, type Reason } from '../data/archetypes';
import { tap } from '../lib/feel';

/** Bottom sheet asking what gave it away. The chosen reason gets circled in pen. */
export function WhySheet({ guessHuman, onPick }: { guessHuman: boolean; onPick: (r: Reason) => void }) {
  const [picked, setPicked] = useState<Reason | null>(null);

  function choose(r: Reason) {
    if (picked) return;
    setPicked(r);
    tap();
    setTimeout(() => onPick(r), 450);
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        padding: '14px 28px 40px',
        borderRadius: '22px 22px 0 0',
        backgroundColor: 'var(--color-card)',
        backgroundImage: 'url(/assets/paper.jpg)',
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        boxShadow: '0 -10px 30px rgba(31,29,27,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(31,29,27,0.18)', alignSelf: 'center' }} />
      <div>
        <div className="display" style={{ fontSize: 28, lineHeight: '32px' }}>
          Why{' '}
          <span style={{ fontStyle: 'italic', color: guessHuman ? 'var(--color-human)' : 'var(--color-ai)' }}>
            {guessHuman ? 'human' : 'AI'}
          </span>
          ?
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-graphite)', marginTop: 4 }}>Pick the thing that gave it away.</div>
      </div>
      <div>
        {REASONS.map((r, i) => (
          <button
            key={r}
            onClick={() => choose(r)}
            style={{
              position: 'relative',
              width: '100%',
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: i < REASONS.length - 1 ? '1px solid rgba(31,29,27,0.1)' : 'none',
              textAlign: 'left',
            }}
          >
            <span className="hand" style={{ fontSize: 24, position: 'relative', padding: '0 4px' }}>
              {r}
              {picked === r && <PenCircle />}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function PenCircle() {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: -14, top: -10, width: 'calc(100% + 28px)', height: 'calc(100% + 20px)', overflow: 'visible' }}
      fill="none"
    >
      <motion.path
        d="M18 34 C 10 12, 70 4, 120 6 S 196 18, 190 34 S 120 58, 70 55 S 4 46, 22 22"
        stroke="var(--color-human)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  );
}
