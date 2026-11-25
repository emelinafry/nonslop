import { useEffect } from 'react';
import { motion } from 'framer-motion';

/** "Reading your palate…" — a dot slides along the cobalt-to-vermilion line and lands on the score. */
export function CalculatingScreen({ share, total, onDone }: { share: number; total: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  const width = 326;
  return (
    <div className="screen" style={{ justifyContent: 'center', padding: '0 32px 120px', gap: 44 }}>
      <div>
        <div className="label">
          {total} of {total} · done
        </div>
        <h2 className="display" style={{ fontSize: 44, lineHeight: '46px', marginTop: 10 }}>
          Reading your
          <br />
          <span style={{ fontStyle: 'italic' }}>palate</span>…
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <svg width="100%" viewBox={`0 0 ${width} 40`} fill="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="spec" x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2E4BD6" />
              <stop offset="0.25" stopColor="#6A55C8" />
              <stop offset="0.5" stopColor="#A04FAE" />
              <stop offset="0.75" stopColor="#CF4E78" />
              <stop offset="1" stopColor="#E4572E" />
            </linearGradient>
          </defs>
          <motion.path
            d="M4 22 C 40 16, 70 26, 110 20 S 190 15, 230 22 S 290 24, 322 18"
            stroke="url(#spec)"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />
          <motion.circle
            cy="21"
            r="10"
            fill="var(--color-card)"
            stroke="var(--color-ink)"
            strokeWidth="2.5"
            initial={{ cx: 4, opacity: 0 }}
            animate={{ cx: 4 + share * (width - 8), opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 60, damping: 12 }}
          />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="hand" style={{ fontSize: 20, color: 'var(--color-ai)' }}>
            trusts everything
          </span>
          <span className="hand" style={{ fontSize: 20, color: 'var(--color-human)' }}>
            tastes everything
          </span>
        </div>
      </div>
    </div>
  );
}
