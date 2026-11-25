import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform, type MotionValue, type PanInfo } from 'framer-motion';
import type { MediaItem, PangramResult } from '../data/cards';
import { MediaContent } from './MediaContent';
import { play, tap } from '../lib/feel';

export type CardMode = 'guess' | 'why' | 'reveal' | 'leaving';

interface Props {
  item: MediaItem;
  mode: CardMode;
  /** Shared with the screen so the background wash can follow the drag. */
  x: MotionValue<number>;
  guessHuman: boolean | null;
  pangram: PangramResult | null;
  reason: string | null;
  /** Called when the player commits a guess by dragging or flinging. */
  onGuess: (human: boolean) => void;
  /** Called after the leaving animation finishes. */
  onLeft: () => void;
}

const FLING_DISTANCE = 120;
const FLING_VELOCITY = 600;
const PARK_X = 64;

export function PlayCard({ item, mode, x, guessHuman, pangram, reason, onGuess, onLeft }: Props) {
  // Drag-driven feel: pivot near the bottom, tilt, bend toward the drag, lift.
  // Rests at -1.5deg, like a card taped down slightly crooked.
  const rotateZ = useTransform(x, [-200, 0, 200], [-13.5, -1.5, 10.5]);
  const dragRotateY = useTransform(x, [-200, 200], [8, -8]);
  const dragScale = useTransform(x, (v) => 1 + Math.min(Math.abs(v) / 200, 1) * 0.03);
  // Growing shadow: a fixed deep shadow fades in over a resting one, so only opacity animates.
  const liftShadow = useTransform(x, (v) => Math.min(Math.abs(v) / 200, 1));
  // Light sliding across the paper grain.
  const sheenX = useTransform(x, [-220, 220], ['0%', '100%']);
  const stampHuman = useTransform(x, [40, 140], [0, 1]);
  const stampAI = useTransform(x, [-140, -40], [1, 0]);

  // Flip for the reveal, with a lift and edge-on shading.
  const flip = useMotionValue(0);
  const lift = useMotionValue(1);
  const rotateY = useTransform([dragRotateY, flip], ([a, b]) => (a as number) + (b as number));
  const scale = useTransform([dragScale, lift], ([a, b]) => (a as number) * (b as number));
  const shade = useTransform(flip, [0, 90, 180], [0, 0.28, 0]);

  const committed = useRef(false);

  useEffect(() => {
    if (mode === 'guess') {
      committed.current = false;
      flip.set(0);
    }
    if (mode === 'why' && guessHuman !== null) {
      animate(x, guessHuman ? PARK_X : -PARK_X, { type: 'spring', stiffness: 300, damping: 24 });
    }
    if (mode === 'reveal') {
      animate(x, 0, { type: 'spring', stiffness: 260, damping: 22 });
      animate(lift, [1, 1.06, 1], { duration: 0.65, times: [0, 0.4, 1] });
      animate(flip, 180, { type: 'spring', stiffness: 160, damping: 18 });
      setTimeout(() => {
        play('stamp');
        tap(12);
      }, 420);
    }
    if (mode === 'leaving') {
      const dir = guessHuman ? 1 : -1;
      play('paper-swish');
      tap();
      // Hand over to the next card as soon as this one is off the table, instead of waiting
      // a second or more for the spring's overshoot to settle somewhere nobody can see.
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        unsubscribe();
        fling.stop();
        onLeft();
      };
      const fling = animate(x, dir * 620, { type: 'spring', stiffness: 220, damping: 22, velocity: dir * 800 });
      const unsubscribe = x.on('change', (v) => {
        if (Math.abs(v) > 480) finish();
      });
      fling.then(finish);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Lets the AI / Human buttons swipe the card too.
  useEffect(() => {
    if (mode !== 'guess') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') commit(true);
      if (e.key === 'ArrowLeft') commit(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function commit(human: boolean) {
    if (committed.current) return;
    committed.current = true;
    play('paper-swish');
    tap();
    onGuess(human);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > FLING_DISTANCE) {
      commit(offset.x > 0);
    } else if (Math.abs(velocity.x) > FLING_VELOCITY) {
      // A quick flick counts in the direction it was thrown, even if the card hadn't travelled far.
      commit(velocity.x > 0);
    } else {
      // Snap back with a little overshoot, like paper settling.
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 18 });
    }
  }

  const correct = guessHuman !== null && guessHuman === item.isHuman;
  const truthColor = item.isHuman ? 'var(--color-human)' : 'var(--color-ai)';

  return (
    <motion.div
      drag={mode === 'guess' ? 'x' : false}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{
        position: 'absolute',
        left: 32,
        right: 32,
        top: 14,
        bottom: 26,
        x,
        rotateZ,
        rotateY,
        scale,
        transformOrigin: '50% 90%',
        transformStyle: 'preserve-3d',
        cursor: mode === 'guess' ? 'grab' : 'default',
        touchAction: 'pan-y',
        zIndex: 2,
      }}
      animate={{ opacity: mode === 'why' ? 0.45 : 1 }}
      whileTap={mode === 'guess' ? { cursor: 'grabbing' } : undefined}
    >
      {/* FRONT */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          boxShadow: REST_SHADOW,
          borderRadius: 3,
        }}
      >
        <LiftShadow opacity={liftShadow} />
        <div className="paper-card" />
        <div className="tape" />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: 20, padding: '38px 28px 26px' }}>
          <div className="label">{item.category}</div>
          <MediaContent item={item} />
        </div>
        <Sheen x={sheenX} />
        <Stamp label="HUMAN" color="var(--color-human)" opacity={stampHuman} rotate={-14} side="left" />
        <Stamp label="AI" color="var(--color-ai)" opacity={stampAI} rotate={12} side="right" />
        <motion.div style={{ position: 'absolute', inset: 0, background: '#1f1d1b', opacity: shade, borderRadius: 3, pointerEvents: 'none' }} />
      </motion.div>

      {/* BACK: the verdict */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          rotateY: 180,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          boxShadow: REST_SHADOW,
          borderRadius: 3,
        }}
      >
        <LiftShadow opacity={liftShadow} />
        <div className="paper-card" />
        <div className="tape" />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: 16, padding: '38px 28px 26px' }}>
          <div className="label">{item.category}</div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <MediaContent item={item} compact />
          </div>
          <div style={{ borderTop: '1px dashed rgba(31,29,27,0.25)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PenMark kind={correct ? 'check' : 'cross'} color={correct ? 'var(--color-human)' : 'var(--color-ai)'} play={mode === 'reveal'} />
              <div className="display" style={{ fontSize: 22, color: truthColor, letterSpacing: '-0.01em' }}>
                {item.isHuman ? 'Made by a human' : 'Generated by AI'}
              </div>
            </div>
            <div className="hand" style={{ fontSize: 20, color: item.isHuman && item.author ? 'var(--color-ink)' : 'var(--color-graphite)', transform: 'rotate(-1.5deg)' }}>
              {item.isHuman && item.author ? `— ${item.author}` : `you said ${guessHuman ? 'human' : 'AI'}${reason ? ` · "${reason}"` : ''}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="label">Pangram</span>
              <span className="hand" style={{ fontSize: 19 }}>
                {pangram
                  ? `${pangram.verdict === (item.isHuman ? 'human' : 'ai') ? 'agrees' : 'got fooled'} — ${Math.round(
                      (pangram.verdict === 'human' ? pangram.fractionHuman : 1 - pangram.fractionHuman) * 100,
                    )}% ${pangram.verdict === 'human' ? 'human' : 'AI'}`
                  : item.kind === 'text'
                    ? 'not scored yet'
                    : 'reads text only'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const REST_SHADOW = '0 4px 10px rgba(31,29,27,0.12)';

function LiftShadow({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 3,
        boxShadow: '0 24px 40px rgba(31,29,27,0.22)',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
}

function Sheen({ x }: { x: MotionValue<string> }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 3,
        pointerEvents: 'none',
        backgroundImage: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)',
        backgroundSize: '220% 100%',
        backgroundPositionX: x,
        mixBlendMode: 'soft-light',
      }}
    />
  );
}

function Stamp({
  label,
  color,
  opacity,
  rotate,
  side,
}: {
  label: string;
  color: string;
  opacity: MotionValue<number>;
  rotate: number;
  side: 'left' | 'right';
}) {
  const scale = useTransform(opacity, [0, 1], [1.4, 1]);
  const blur = useTransform(opacity, [0, 0.7, 1], ['blur(2px)', 'blur(0.5px)', 'blur(0px)']);
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: 34,
        [side]: 24,
        padding: '6px 16px',
        border: `3px solid ${color}`,
        borderRadius: 6,
        color,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: '0.08em',
        rotate,
        opacity,
        scale,
        filter: blur,
        pointerEvents: 'none',
      }}
    >
      {label}
    </motion.div>
  );
}

function PenMark({ kind, color, play: shouldPlay }: { kind: 'check' | 'cross'; color: string; play: boolean }) {
  const transition = { delay: 0.5, duration: 0.35, ease: 'easeOut' as const };
  return (
    <svg width="26" height="24" viewBox="0 0 26 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'check' ? (
        <motion.path d="M2 12.5 L9.5 20 L24 3" initial={{ pathLength: 0 }} animate={{ pathLength: shouldPlay ? 1 : 0 }} transition={transition} />
      ) : (
        <>
          <motion.path d="M4 4.5 L21 20" initial={{ pathLength: 0 }} animate={{ pathLength: shouldPlay ? 1 : 0 }} transition={transition} />
          <motion.path
            d="M20.5 4 L4.5 20.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: shouldPlay ? 1 : 0 }}
            transition={{ ...transition, delay: 0.75 }}
          />
        </>
      )}
    </svg>
  );
}
