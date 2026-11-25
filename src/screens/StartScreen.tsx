import { motion } from 'framer-motion';
import { Capybara } from '../components/Capybara';

/**
 * Start C — "Psst". A plain capybara with a speech bubble leans in and lets you in on the secret.
 * Matches the "Start C — Psst" frame in the Paper file.
 */
export function StartScreen({ total, onStart }: { total: number; onStart: () => void }) {
  return (
    <div className="screen" style={{ padding: '72px 28px 40px' }}>
      {/* Soft watercolor wash at the bottom corners, like the Paper frame */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 80% 40% at 15% 100%, rgba(46,75,214,0.28) 0%, rgba(46,75,214,0) 100%),' +
            'radial-gradient(ellipse 75% 38% at 95% 92%, rgba(228,87,46,0.28) 0%, rgba(228,87,46,0) 100%),' +
            'radial-gradient(ellipse 60% 30% at 55% 105%, rgba(160,79,174,0.2) 0%, rgba(160,79,174,0) 100%)',
        }}
      />

      <div className="label">{total} pieces · about 3 minutes</div>
      <h1 className="display" style={{ fontSize: 88, lineHeight: '80px', letterSpacing: '-0.04em', marginTop: 20 }}>
        Hot
        <br />
        or <span style={{ fontStyle: 'italic', color: 'var(--color-human)' }}>Slop</span>
      </h1>
      <div className="hand" style={{ fontSize: 26, marginTop: 22, transform: 'rotate(-2deg)', width: 'fit-content' }}>
        can you tell who made it?
      </div>

      {/* Scene: speech bubble + capybara */}
      <div style={{ position: 'relative', flex: 1, minHeight: 280 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 16 }}
          style={{
            position: 'absolute',
            left: -10,
            top: 30,
            width: 180,
            padding: '16px 18px 18px',
            borderRadius: 18,
            backgroundColor: 'var(--color-card)',
            backgroundImage: 'url(/assets/paper.jpg)',
            backgroundSize: 'cover',
            backgroundBlendMode: 'multiply',
            boxShadow: '0 8px 22px rgba(31,29,27,0.12)',
            transformOrigin: '100% 60%',
            zIndex: 2,
          }}
        >
          <p className="hand" style={{ fontSize: 24, lineHeight: '27px' }}>
            psst. half of these were made by a robot.
          </p>
          <p className="hand" style={{ fontSize: 18, lineHeight: '22px', color: 'var(--color-human)', paddingTop: 8 }}>
            bet you can't tell which.
          </p>
          {/* Tail pointing at the capybara */}
          <svg width="40" height="34" viewBox="0 0 40 34" style={{ position: 'absolute', right: -30, top: 64 }} aria-hidden>
            <path d="M0 4 L38 26 L4 22 Z" fill="var(--color-card)" />
          </svg>
        </motion.div>

        <div style={{ position: 'absolute', right: -10, bottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 14 }}
          >
            {/* Gentle lean-in loop, like it's whispering */}
            <motion.div
              animate={{ rotate: [0, -3, 0], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 1.4 }}
              style={{ transformOrigin: '50% 100%' }}
            >
              <Capybara pixel={7} />
            </motion.div>
          </motion.div>
          <div style={{ width: 168, height: 14, borderRadius: '50%', background: 'rgba(31,29,27,0.14)', marginTop: -6 }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0' }}>
        <span className="hand" style={{ fontSize: 22, color: 'var(--color-ai)' }}>
          ← AI
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-graphite)' }}>swipe to guess</span>
        <span className="hand" style={{ fontSize: 22, color: 'var(--color-human)' }}>
          human →
        </span>
      </div>
      <button className="pill pill--ink" onClick={onStart}>
        Start
      </button>
    </div>
  );
}
