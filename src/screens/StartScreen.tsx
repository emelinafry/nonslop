import { motion } from 'framer-motion';

export function StartScreen({ total, onStart }: { total: number; onStart: () => void }) {
  return (
    <div className="screen" style={{ padding: '72px 28px 40px' }}>
      <div className="label">{total} pieces · about 3 minutes</div>
      <h1 className="display" style={{ fontSize: 88, lineHeight: '80px', letterSpacing: '-0.04em', marginTop: 20 }}>
        Hot
        <br />
        or <span style={{ fontStyle: 'italic', color: 'var(--color-human)' }}>Slop</span>
      </h1>
      <div className="hand" style={{ fontSize: 26, marginTop: 22, transform: 'rotate(-2deg)', width: 'fit-content' }}>
        can you tell who made it?
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 200 }}>
        <motion.div
          initial={{ rotate: 7, y: 20, opacity: 0 }}
          animate={{ rotate: 7, y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ position: 'absolute', left: 150, top: 40, width: 190, height: 140, boxShadow: '0 8px 20px rgba(31,29,27,0.10)' }}
        >
          <div className="paper-card" />
        </motion.div>
        <motion.div
          initial={{ rotate: -5, y: 30, opacity: 0 }}
          animate={{ rotate: -5, y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ position: 'absolute', left: 20, top: 66, width: 200, height: 150, boxShadow: '0 8px 20px rgba(31,29,27,0.12)' }}
        >
          <div className="paper-card" />
          <div className="tape" style={{ width: 80, marginLeft: -40, transform: 'rotate(-4deg)' }} />
          <div style={{ position: 'relative', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="label" style={{ fontSize: 10 }}>
              Text to a friend
            </div>
            <div className="display" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '-0.01em' }}>
              just landed. call me when you wake up
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
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
