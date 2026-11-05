import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';

export type V3 = [number, number, number];

interface BxProps { p?: V3; s: V3; c: string; m?: number; r?: number; o?: number; rot?: V3; e?: string }
/** Box primitive. `p` is the CENTRE of the box. */
export function Bx({ p = [0, 0, 0], s, c, m = 0.1, r = 0.6, o = 1, rot = [0, 0, 0], e }: BxProps) {
  return (
    <mesh position={p} rotation={rot}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} metalness={m} roughness={r} transparent={o < 1} opacity={o}
        emissive={e ?? '#000000'} emissiveIntensity={e ? 0.7 : 0} />
    </mesh>
  );
}

interface CyProps { p?: V3; r: number; h: number; c: string; m?: number; ro?: number; o?: number; rot?: V3; seg?: number }
/** Cylinder primitive (axis = Y unless rotated). */
export function Cy({ p = [0, 0, 0], r, h, c, m = 0.1, ro = 0.6, o = 1, rot = [0, 0, 0], seg = 28 }: CyProps) {
  return (
    <mesh position={p} rotation={rot}>
      <cylinderGeometry args={[r, r, h, seg]} />
      <meshStandardMaterial color={c} metalness={m} roughness={ro} transparent={o < 1} opacity={o} />
    </mesh>
  );
}

/** Black female/male pin header with optional gold pins on top. */
export function Hdr({ p = [0, 0, 0], len, d = 0.14, h = 0.22, pins = 0, axis = 'x' }:
  { p?: V3; len: number; d?: number; h?: number; pins?: number; axis?: 'x' | 'z' }) {
  const s: V3 = axis === 'x' ? [len, h, d] : [d, h, len];
  const arr = Array.from({ length: pins }, (_, i) => (i - (pins - 1) / 2) * (len / Math.max(pins, 1)));
  return (
    <group position={p}>
      <Bx p={[0, h / 2, 0]} s={s} c="#141414" r={0.8} />
      {arr.map((o, i) => (
        <Bx key={i} p={axis === 'x' ? [o, h + 0.04, 0] : [0, h + 0.04, o]} s={[0.04, 0.1, 0.04]} c="#d4af37" m={0.9} r={0.3} />
      ))}
    </group>
  );
}

/** Many small dark holes drawn with one InstancedMesh (cheap). */
export function BreadboardHoles() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const cols = [-1.45, -1.25, -0.95, -0.75, -0.55, -0.35, -0.15, 0.15, 0.35, 0.55, 0.75, 0.95, 1.25, 1.45];
  const rows = 30;
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    let i = 0;
    for (const x of cols) {
      for (let r = 0; r < rows; r++) {
        o.position.set(x, 0.206, (r - (rows - 1) / 2) * 0.135);
        o.updateMatrix();
        ref.current.setMatrixAt(i++, o.matrix);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cols.length * rows]}>
      <boxGeometry args={[0.07, 0.012, 0.07]} />
      <meshStandardMaterial color="#2a2a2a" />
    </instancedMesh>
  );
}
