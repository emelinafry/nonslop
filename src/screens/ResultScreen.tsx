import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArchetypeBackground } from '../components/ArchetypeBackground';
import { Capybara } from '../components/Capybara';
import type { MediaItem } from '../data/cards';
import type { Answer } from './PlayScreen';
import { tellCopy, type Summary } from '../lib/score';

interface Props {
  summary: Summary;
  answers: Answer[];
  deck: MediaItem[];
  onReplay: () => void;
}

export function ResultScreen({ summary, answers, deck, onReplay }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { archetype } = summary;
  const tell = tellCopy(summary);

  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `I'm The ${archetype.name} on Hot or Slop: ${summary.correct}/${summary.total} right. Can you tell who made it?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Hot or Slop', text, url: location.href });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return; // player closed the share sheet
      }
    }
    // Web Share and the async clipboard only exist on https/localhost. Over plain http on
    // local wifi (vite --host), fall back to the old textarea copy so Share still works.
    if (await copyText(`${text} ${location.href}`)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="screen">
      <ArchetypeBackground archetype={archetype} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '64px 28px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="label">Your archetype</span>
            <span className="label">
              {summary.correct} / {summary.total} correct
            </span>
          </div>
          <motion.h1
            className="display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ fontSize: 64, lineHeight: '60px', letterSpacing: '-0.045em' }}
          >
            The
            <br />
            <span style={{ fontStyle: 'italic', color: archetype.color }}>{archetype.name}</span>
          </motion.h1>
          <motion.p
            className="hand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: 26, lineHeight: '30px', transform: 'rotate(-1.5deg)', whiteSpace: 'pre-line', paddingTop: 4 }}
          >
            {archetype.oneLiner}
          </motion.p>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18 }}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 220, damping: 14 }}
          >
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 1.4 }}>
              <Capybara archetype={archetype.id} pixel={8} />
            </motion.div>
          </motion.div>
          <div style={{ width: 170, height: 14, borderRadius: '50%', background: 'rgba(31,29,27,0.14)', marginTop: -6 }} />
        </div>

        <div style={{ padding: '0 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: '16px 18px', background: 'rgba(252,251,249,0.8)', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="label">Your tell</span>
            <p className="display" style={{ fontSize: 19, lineHeight: '25px', letterSpacing: '-0.01em' }}>
              {tell.lead}{' '}
              {tell.reason && (
                <span className="hand" style={{ fontSize: 22, color: archetype.color }}>
                  {tell.reason}
                </span>
              )}
              {tell.tail}
            </p>
            {summary.writing.scored > 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-graphite)' }}>
                On the writing: you {summary.writing.you}/{summary.writing.total}, Pangram {summary.writing.pangram}/{summary.writing.scored}.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="pill pill--outline" style={{ flex: 1 }} onClick={() => setShowBreakdown(true)}>
              Breakdown
            </button>
            <button className="pill pill--ink" style={{ flex: 1 }} onClick={share}>
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            key="breakdown"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: '78%',
              zIndex: 10,
              borderRadius: '22px 22px 0 0',
              backgroundColor: 'var(--color-card)',
              backgroundImage: 'url(/assets/paper.jpg)',
              backgroundSize: 'cover',
              backgroundBlendMode: 'multiply',
              boxShadow: '0 -10px 30px rgba(31,29,27,0.15)',
              padding: '14px 28px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(31,29,27,0.18)', alignSelf: 'center' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 className="display" style={{ fontSize: 28 }}>
                Report card
              </h3>
              <span className="hand" style={{ fontSize: 24, color: 'var(--color-human)' }}>
                {summary.correct}/{summary.total}
              </span>
            </div>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {deck.map((item, i) => {
                const a = answers.find((x) => x.id === item.id);
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(31,29,27,0.1)' }}>
                    <span style={{ width: 22, fontSize: 12, color: 'var(--color-graphite)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ flex: 1, fontSize: 14 }}>
                      {item.kind === 'text' ? `“${item.text?.slice(0, 34)}${(item.text?.length ?? 0) > 34 ? '…' : ''}”` : `${item.kind} · ${item.category}`}
                    </span>
                    <span style={{ fontSize: 12, color: item.isHuman ? 'var(--color-human)' : 'var(--color-ai)' }}>{item.isHuman ? 'human' : 'AI'}</span>
                    <span className="hand" style={{ width: 22, textAlign: 'right', fontSize: 20, color: a?.correct ? 'var(--color-human)' : 'var(--color-ai)' }}>
                      {a?.correct ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="pill pill--outline" style={{ flex: 1 }} onClick={() => setShowBreakdown(false)}>
                Close
              </button>
              <button className="pill pill--ink" style={{ flex: 1 }} onClick={onReplay}>
                Play again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the textarea copy */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
