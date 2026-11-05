import * as THREE from 'three';
import { KIT_COMPONENTS } from '../../data/kitComponents';
import { CX, CY, S } from '../../utils/coords';

/** Draws the purple PCB with white silkscreen (section lines + labels) in photo-pixel space. */
export function makeBoardTexture(): THREE.CanvasTexture {
  const W = 1070, H = 1140, K = 2, OX = 120, OY = 250;
  const cv = document.createElement('canvas');
  cv.width = W * K; cv.height = H * K;
  const ctx = cv.getContext('2d')!;
  ctx.scale(K, K);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#73226a'); g.addColorStop(1, '#5e1a58');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // faint dotted PCB texture
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = 6; x < W; x += 14) for (let y = 6; y < H; y += 14) ctx.fillRect(x, y, 1.2, 1.2);

  const X = (x: number) => x - OX;
  const Y = (y: number) => y - OY;

  // section divider lines
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5;
  const line = (x1: number, y1: number, x2: number, y2: number) => { ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke(); };
  line(590, 280, 590, 1390); line(120, 485, 590, 485); line(120, 760, 590, 760); line(120, 1190, 590, 1190);
  line(590, 630, 1190, 630); line(820, 940, 1190, 940); line(820, 1150, 1190, 1150); line(590, 1150, 820, 1150);

  // outline around every component
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
  for (const c of KIT_COMPONENTS) {
    const cx = c.position[0] / S + CX, cy = c.position[1] / S + CY;
    const w = c.size[0] / S, h = c.size[2] / S;
    ctx.strokeRect(X(cx - w / 2 - 6), Y(cy - h / 2 - 6), w + 12, h + 12);
  }

  ctx.fillStyle = '#ffffff';
  const label = (t: string, x: number, y: number, size = 15, rot = 0) => {
    ctx.save(); ctx.translate(X(x), Y(y)); ctx.rotate((rot * Math.PI) / 180);
    ctx.font = `bold ${size}px Arial, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(t, 0, 0); ctx.restore();
  };
  label('ULTRASONIC SENSOR', 250, 352, 14); label('TEMP/RH SENSOR', 150, 462, 12); label('TEMPERATURE SENSOR', 330, 498, 12);
  label('IR SENSOR', 250, 508, 14); label('BUZZER', 225, 772, 14); label('XBEE INTERFACE', 490, 512, 14);
  label('LoRaWAN INTERFACE', 458, 770, 14); label('BLUETOOTH', 770, 512, 15); label('LCD INTERFACE', 722, 950, 14);
  label('PROBE TESTER', 905, 620, 13); label('RASPBERRY PI - 3/4', 800, 372, 14); label('GENERAL I/O', 465, 1165, 14);
  label('RELAY', 230, 1385, 15); label('POTENTIOMETER', 470, 1388, 14); label('SIM800C GSM MODULE', 745, 1398, 12);
  label('PI-PICO W', 967, 1125, 14); label('ESP8266', 1077, 1275, 14); label('POWER EXTENSION', 1010, 1368, 14);
  label('DC IN: 6V to 24V', 1030, 272, 11);
  // title block
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(X(472), Y(775), 110, 195);
  ctx.fillStyle = '#ffffff';
  label('thingZkit® IoT', 505, 870, 30, -90); label('#enthutech', 560, 870, 30, -90);
  label('TKB000028', 445, 830, 12, -90);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
