export type ComponentId =
  | 'ultrasonic' | 'breadboard' | 'pico' | 'uno' | 'esp8266' | 'probe'
  | 'lcd' | 'sim800c' | 'xbee' | 'lora' | 'potentiometer' | 'relay'
  | 'buzzer' | 'ir' | 'temperature' | 'dht11' | 'generalio' | 'bluetooth';

export type ComponentKind =
  | 'board' | 'sensor' | 'actuator' | 'wireless' | 'display'
  | 'interface' | 'input' | 'prototyping';

export interface KitComponent {
  id: ComponentId;
  name: string;
  kind: ComponentKind;
  /** one short, school-level sentence */
  summary: string;
  /** board position in 3D units: [x, z] */
  position: [number, number];
  /** bounding size in 3D units: [width, height, depth] (used for highlight + camera) */
  size: [number, number, number];
}

export interface QuizResult { score: number; total: number; passed: boolean; answers: number[]; date: string }
export interface FeedbackData {
  name: string; cls: string; school: string;
  overall: number; usability: number; learning: number;
  favorite: string; suggestions: string; date: string;
}
