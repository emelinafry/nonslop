/** Progress as hand-drawn tally marks, crossed in groups of five. */
export function Tally({ done, total }: { done: number; total: number }) {
  const groups = Math.ceil(total / 5);
  const groupWidth = 46;
  return (
    <svg width={groups * groupWidth} height={30} viewBox={`0 0 ${groups * groupWidth} 30`} fill="none" strokeLinecap="round">
      {Array.from({ length: total }).map((_, i) => {
        const g = Math.floor(i / 5);
        const j = i % 5;
        const x = g * groupWidth + 4 + j * 9;
        const isDone = i < done;
        if (j === 4) {
          // fifth mark: the diagonal slash across the group
          return (
            <path
              key={i}
              d={`M${g * groupWidth} 20 L${g * groupWidth + 36} 8`}
              stroke="var(--color-ink)"
              strokeOpacity={isDone ? 1 : 0.18}
              strokeWidth={2}
            />
          );
        }
        const wobble = j % 2 === 0 ? 1 : -1;
        return (
          <path
            key={i}
            d={`M${x} 4 L${x + wobble} 26`}
            stroke="var(--color-ink)"
            strokeOpacity={isDone ? 1 : 0.18}
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}
