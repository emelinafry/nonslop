import { MeshGradient } from '@paper-design/shaders-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Archetype } from '../data/archetypes';

const PAPER = '#F4F3F1';

/**
 * Animated watercolor wash for the result screen.
 * Mesh gradient (Paper Shaders) -> paper texture multiplied on top -> fade to paper behind the title.
 * grainMixer roughens the color edges so it reads as paint, not a default gradient.
 */
export function ArchetypeBackground({ archetype }: { archetype: Archetype }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}
    >
      <MeshGradient
        colors={archetype.mesh}
        distortion={0.85}
        swirl={0.15}
        grainMixer={0.3}
        grainOverlay={0.06}
        speed={reduceMotion ? 0 : 0.15}
        offsetY={0.35}
        scale={1.2}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/paper.jpg)',
          backgroundSize: 'cover',
          mixBlendMode: 'multiply',
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${PAPER} 0%, ${PAPER}CC 28%, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
