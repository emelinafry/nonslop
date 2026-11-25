import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { DECK } from './data/cards';
import { StartScreen } from './screens/StartScreen';
import { PlayScreen, type Answer } from './screens/PlayScreen';
import { CalculatingScreen } from './screens/CalculatingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { summarize } from './lib/score';

type Phase = 'start' | 'play' | 'calc' | 'result';

/** The design canvas, in the Paper file's pixels. */
const DESIGN_W = 390;
const DESIGN_H = 844;

/**
 * Fits the design canvas to the window. Everything inside is laid out in design pixels and the
 * whole canvas is scaled, so text never outgrows the screen.
 * - Phone-width windows fill the screen: the canvas keeps at least 390 x 844 design pixels and
 *   stretches along whichever side has room to spare, so there are no letterbox bars.
 * - Wider windows show a 390 x 844 phone frame, as large as fits with a margin, never upscaled.
 */
function useFit() {
  const read = () => {
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    if (vw < 500) {
      const s = Math.min(vw / DESIGN_W, vh / DESIGN_H);
      return { w: vw / s, h: vh / s, s, framed: false };
    }
    const s = Math.min((vw - 48) / DESIGN_W, (vh - 48) / DESIGN_H, 1);
    return { w: DESIGN_W, h: DESIGN_H, s, framed: true };
  };
  const [fit, setFit] = useState(read);
  useEffect(() => {
    const update = () => setFit(read());
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return fit;
}

/** Shuffle so every round deals the pieces in a different order. */
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('start');
  const [deck, setDeck] = useState(DECK);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const summary = useMemo(() => summarize(answers, deck), [answers, deck]);

  const start = () => {
    setDeck(shuffle(DECK));
    setAnswers([]);
    setPhase('play');
  };
  const showResult = useCallback(() => setPhase('result'), []);
  const fit = useFit();
  // Drag gestures arrive in screen pixels; convert them to design pixels so the card tracks the finger.
  const transformPagePoint = useCallback((p: { x: number; y: number }) => ({ x: p.x / fit.s, y: p.y / fit.s }), [fit.s]);
  const fitVars = { '--fit-w': fit.w, '--fit-h': fit.h, '--fit-s': fit.s } as CSSProperties;

  return (
    <div className="stage">
    <MotionConfig transformPagePoint={transformPagePoint}>
    <main className={fit.framed ? 'app app--framed' : 'app'} style={fitVars}>
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          {phase === 'start' && <StartScreen total={DECK.length} onStart={start} />}
          {phase === 'play' && (
            <PlayScreen
              deck={deck}
              onQuit={() => setPhase('start')}
              onDone={(a) => {
                setAnswers(a);
                setPhase('calc');
              }}
            />
          )}
          {phase === 'calc' && <CalculatingScreen share={summary.correct / summary.total} total={summary.total} onDone={showResult} />}
          {phase === 'result' && <ResultScreen summary={summary} answers={answers} deck={deck} onReplay={start} />}
        </motion.div>
      </AnimatePresence>
    </main>
    </MotionConfig>
    </div>
  );
}
