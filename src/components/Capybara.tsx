import { CAPY_ACCESSORIES, CAPY_BASE, CAPY_GRID, type PixelRun } from '../data/capybaras';
import type { ArchetypeId } from '../data/archetypes';

function Layer({ runs }: { runs: PixelRun[] }) {
  return (
    <>
      {runs.map(([x, y, w, fill], i) => (
        <rect key={i} x={x} y={y} width={w} height={1} fill={fill} />
      ))}
    </>
  );
}

/** Front-facing pixel capybara, dressed for an archetype. */
export function Capybara({ archetype, pixel = 8 }: { archetype?: ArchetypeId; pixel?: number }) {
  return (
    <svg
      width={CAPY_GRID.width * pixel}
      height={CAPY_GRID.height * pixel}
      viewBox={`0 0 ${CAPY_GRID.width} ${CAPY_GRID.height}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={archetype ? `${archetype} capybara` : 'capybara'}
    >
      <Layer runs={CAPY_BASE} />
      {archetype && <Layer runs={CAPY_ACCESSORIES[archetype]} />}
    </svg>
  );
}
