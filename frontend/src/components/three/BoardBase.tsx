import { useMemo } from 'react';
import { BOARD_D, BOARD_T, BOARD_TOP, BOARD_W, px } from '../../utils/coords';
import { Bx, Cy, Hdr } from './primitives';
import { makeBoardTexture } from './boardTexture';

const SILVER = '#c3c7cd';

/** Purple PCB, wooden frame and non-clickable board details (power section, headers, connectors). */
export default function BoardBase() {
  const tex = useMemo(() => makeBoardTexture(), []);
  const at = (x: number, y: number, y0 = 0): [number, number, number] => { const [a, b] = px(x, y); return [a, y0, b]; };

  return (
    <group>
      {/* PCB */}
      <mesh>
        <boxGeometry args={[BOARD_W, BOARD_T, BOARD_D]} />
        <meshStandardMaterial color="#5e1a58" roughness={0.55} />
      </mesh>
      <mesh position={[0, BOARD_TOP + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BOARD_W, BOARD_D]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* wooden frame (as in the photos) */}
      <group position={[0, -0.04, 0]}>
        <Bx p={[0, 0, -(BOARD_D / 2 + 0.4)]} s={[BOARD_W + 1.6, 0.4, 0.8]} c="#e2c391" r={0.85} m={0} />
        <Bx p={[0, 0, BOARD_D / 2 + 0.4]} s={[BOARD_W + 1.6, 0.4, 0.8]} c="#e2c391" r={0.85} m={0} />
        <Bx p={[-(BOARD_W / 2 + 0.4), 0, 0]} s={[0.8, 0.4, BOARD_D]} c="#e2c391" r={0.85} m={0} />
        <Bx p={[BOARD_W / 2 + 0.4, 0, 0]} s={[0.8, 0.4, BOARD_D]} c="#e2c391" r={0.85} m={0} />
      </group>

      <group position={[0, BOARD_TOP, 0]}>
        {/* mounting screws */}
        {[[125, 268], [1135, 610], [1135, 1330], [100, 1365], [648, 1350], [125, 715]].map(([x, y]) => (
          <Cy key={`${x}${y}`} p={at(x, y, 0.03)} r={0.13} h={0.06} c={SILVER} m={0.9} ro={0.3} />
        ))}

        {/* Raspberry Pi header block (IDC + female header) */}
        <Bx p={at(780, 335, 0.27)} s={[3.5, 0.55, 0.75]} c="#141414" r={0.7} />
        <Bx p={at(780, 335, 0.56)} s={[3.0, 0.03, 0.35]} c="#2a2a2a" />
        <Bx p={at(770, 435, 0.16)} s={[2.6, 0.32, 0.28]} c="#141414" r={0.8} />
        <Bx p={at(770, 400, 0.16)} s={[2.6, 0.32, 0.18]} c="#141414" r={0.8} />

        {/* power section */}
        {[425, 495, 560].map((y) => <Cy key={y} p={at(985, y, 0.25)} r={0.28} h={0.5} c="#5a3b3b" ro={0.5} />)}
        {[425, 492, 558].map((y) => (
          <group key={y}>
            <Cy p={at(1150, y, 0.4)} r={0.38} h={0.8} c="#1c1c1c" ro={0.4} />
            <Cy p={at(1150, y, 0.81)} r={0.34} h={0.02} c={SILVER} m={0.8} ro={0.3} />
          </group>
        ))}
        {[435, 505, 570].map((y) => <Bx key={y} p={at(1040, y, 0.15)} s={[0.4, 0.3, 0.4]} c="#262626" />)}
        <Bx p={at(1075, 322, 0.3)} s={[1.0, 0.6, 0.7]} c="#111" r={0.7} />
        <Cy p={at(1075, 290, 0.3)} r={0.18} h={0.5} c="#222" rot={[Math.PI / 2, 0, 0]} />
        <Cy p={at(1105, 355, 0.12)} r={0.12} h={0.24} c="#2563eb" />

        {/* power extension sockets, Pico sockets */}
        {[1192, 1243, 1295, 1343].map((y) => <Bx key={y} p={at(985, y, 0.12)} s={[2.2, 0.25, 0.2]} c="#141414" r={0.8} />)}
        <Bx p={at(965, 1130, 0.07)} s={[2.4, 0.15, 0.13]} c="#141414" r={0.8} />
        <Bx p={at(965, 943, 0.07)} s={[2.3, 0.15, 0.13]} c="#141414" r={0.8} />

        {/* small controls and connectors */}
        <group position={at(330, 775)}><Bx p={[0, 0.05, 0]} s={[0.3, 0.1, 0.3]} c="#222" /><Cy p={[0, 0.14, 0]} r={0.1} h={0.1} c="#d33" /></group>
        <group position={at(1085, 1300)}><Bx p={[0, 0.05, 0]} s={[0.3, 0.1, 0.3]} c="#222" /><Cy p={[0, 0.14, 0]} r={0.1} h={0.1} c="#d33" /></group>
        <group position={at(330, 515)}><Bx p={[0, 0.09, 0]} s={[0.55, 0.18, 0.28]} c="#1a1a1a" /><Bx p={[-0.08, 0.2, 0]} s={[0.18, 0.1, 0.18]} c="#eee" /></group>
        <group position={at(565, 550)}><Cy p={[0, 0.14, 0]} r={0.13} h={0.28} c="#d4af37" m={0.9} ro={0.3} /></group>
        <Cy p={at(600, 1330, 0.17)} r={0.45} h={0.34} c="#2b2b30" ro={0.5} />
        <Bx p={at(800, 1362, 0.25)} s={[0.7, 0.5, 0.7]} c={SILVER} m={0.85} r={0.3} />
        <Hdr p={at(300, 410)} len={0.3} d={0.12} h={0.18} pins={2} axis="z" />
      </group>
    </group>
  );
}
