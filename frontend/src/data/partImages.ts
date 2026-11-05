import type { SimProject, PartDef } from './simProjects';

/** Which real component picture (public/components/*.png) matches each simulation part. */
const IMG: Record<string, string> = { btn: 'buttons', buz: 'buzzer', dht: 'dht11', grn: 'leds', led: 'leds', red: 'leds', yel: 'leds', lcd: 'lcd', ldr: 'ldr', pot: 'pot', rel: 'relay', soil: 'soil' };
export const TINTS = ['#fde68a', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fed7aa'];
export interface Visual { key: string; img?: string; emoji: string; label: string }

export const partVisual = (p: PartDef): Visual => ({ key: p.id, img: IMG[p.id], emoji: p.icon, label: p.label });

/** Arduino first, then the circuit's own parts (pictures de-duplicated). */
export function projectVisuals(p: SimProject, max = 3): Visual[] {
  const out: Visual[] = [{ key: 'uno', img: 'arduino-uno', emoji: '🧠', label: 'Arduino Uno' }];
  for (const part of p.parts) {
    const v = partVisual(part);
    if (v.img && out.some(o => o.img === v.img)) continue;
    out.push(v);
  }
  return out.slice(0, max);
}
