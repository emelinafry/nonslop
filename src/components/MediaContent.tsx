import { useState } from 'react';
import type { MediaItem } from '../data/cards';

/** Renders the piece on a card: written text, a photo, or a looping silent clip. */
export function MediaContent({ item, compact = false }: { item: MediaItem; compact?: boolean }) {
  const [missing, setMissing] = useState(false);

  if (item.kind === 'text') {
    return (
      <p
        className="display"
        style={{
          fontSize: compact ? 22 : (item.text?.length ?? 0) > 90 ? 24 : 28,
          lineHeight: compact ? '30px' : '36px',
          letterSpacing: '-0.01em',
        }}
      >
        {item.text}
      </p>
    );
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
