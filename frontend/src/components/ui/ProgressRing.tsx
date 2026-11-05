import type { CSSProperties, ReactNode } from 'react';

/** Round progress meter drawn with a CSS conic-gradient. */
export default function ProgressRing({ pct, size = 150, children }: { pct: number; size?: number; children?: ReactNode }) {
  const style = { '--p': Math.max(0, Math.min(100, pct)), width: size, height: size } as CSSProperties;
  return (
    <div className="ring7" style={style} role="img" aria-label={`${pct} percent complete`}>
      <div className="ring7-in">{children ?? <b>{pct}%</b>}</div>
    </div>
  );
}
