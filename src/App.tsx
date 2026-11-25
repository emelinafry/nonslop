import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DECK } from './data/cards';
import { StartScreen } from './screens/StartScreen';
import { PlayScreen, type Answer } from './screens/PlayScreen';
import { CalculatingScreen } from './screens/CalculatingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { summarize } from './lib/score';

type Phase = 'start' | 'play' | 'calc' | 'result';

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

  return (
    <main className="app">
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
  );
}
