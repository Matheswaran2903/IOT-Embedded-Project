import type { CSSProperties } from 'react';

// left %, top %, size px, spin seconds, colour, delay s
const CUBES: [number, number, number, number, string, number][] = [
  [6, 18, 54, 26, '#2de2e6', 0], [90, 12, 70, 34, '#ffd23f', -6], [14, 68, 46, 30, '#ff6b81', -12],
  [84, 62, 60, 28, '#a78bfa', -3], [48, 8, 38, 38, '#6ee7a8', -9], [66, 82, 42, 32, '#2de2e6', -15], [32, 40, 30, 36, '#ffd23f', -20],
];

/** Calm animated 3D scene behind every page: a moving grid floor plus slowly turning cubes. Pure CSS, so it is light on school PCs. */
export default function Backdrop3D() {
  return (
    <div className="backdrop3d" aria-hidden="true">
      <div className="bd-floor" />
      <div className="bd-scene">
        {CUBES.map(([l, t, s, d, c, delay], i) => (
          <div key={i} className="cube" style={{ left: `${l}%`, top: `${t}%`, '--s': `${s}px`, '--t': `${d}s`, '--c': c, animationDelay: `${delay}s` } as CSSProperties}>
            <i /><i /><i /><i /><i /><i />
          </div>
        ))}
      </div>
    </div>
  );
}
