import { useLayoutEffect, useRef, useState } from 'react';
import type { MediaItem } from '../data/cards';

/** Renders the piece on a card: written text, a photo, or a looping silent clip. */
export function MediaContent({ item, compact = false }: { item: MediaItem; compact?: boolean }) {
  const [missing, setMissing] = useState(false);

  if (item.kind === 'text') {
    return <FitText text={item.text ?? ''} max={compact ? 22 : 28} />;
  }

  if (missing || !item.src) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 180,
          border: '1.5px dashed rgba(31,29,27,0.25)',
          borderRadius: 4,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          padding: 16,
        }}
      >
        <div>
          <div className="hand" style={{ fontSize: 22 }}>
            {item.kind} goes here
          </div>
          <div className="label" style={{ marginTop: 6, textTransform: 'none', letterSpacing: 0 }}>
            add public{item.src}
          </div>
        </div>
      </div>
    );
  }

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    flex: 1,
    minHeight: 0,
    objectFit: 'cover',
    borderRadius: 2,
    pointerEvents: 'none',
    display: 'block',
  };

  return item.kind === 'image' ? (
    <img src={item.src} alt="" draggable={false} style={mediaStyle} onError={() => setMissing(true)} />
  ) : (
    <video src={item.src} style={mediaStyle} autoPlay muted loop playsInline onError={() => setMissing(true)} />
  );
}

/**
 * Card text at the design size (28px front, 22px back) when it fits, stepping down only as far
 * as a longer piece needs so a full paragraph never runs off the card. Re-fits when the card
 * resizes or the web font finishes loading.
 */
function FitText({ text, max, min = 12 }: { text: string; max: number; min?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const para = useRef<HTMLParagraphElement>(null);
  const [size, setSize] = useState(max);

  useLayoutEffect(() => {
    const el = box.current;
    const p = para.current;
    if (!el || !p) return;
    const apply = (px: number) => {
      p.style.fontSize = `${px}px`;
      p.style.lineHeight = `${Math.round(px * 1.29)}px`;
    };
    const fit = () => {
      if (!el.clientHeight) return;
      let lo = min;
      let hi = max;
      apply(max);
      if (p.offsetHeight <= el.clientHeight) lo = max;
      else {
        while (hi - lo > 0.5) {
          const mid = (lo + hi) / 2;
          apply(mid);
          if (p.offsetHeight <= el.clientHeight) lo = mid;
          else hi = mid;
        }
      }
      const best = Math.floor(lo * 2) / 2;
      apply(best);
      setSize(best);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text, max, min]);

  return (
    <div ref={box} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <p ref={para} className="display" style={{ fontSize: size, lineHeight: `${Math.round(size * 1.29)}px`, letterSpacing: '-0.01em' }}>
        {text}
      </p>
    </div>
  );
}
