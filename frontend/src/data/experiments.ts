import type { ComponentId } from '../types';

export type Values = Record<string, number | boolean | string>;
export type SimState = Record<string, number | boolean | string>;

export interface Control {
  id: string; label: string; type: 'slider' | 'switch' | 'text' | 'button';
  min?: number; max?: number; step?: number; unit?: string; def: number | boolean | string; maxLen?: number;
}
export type Visual =
  | { kind: 'led'; label: string; on: boolean; level: number; color: string }
  | { kind: 'buzzer'; on: boolean }
  | { kind: 'relay'; on: boolean }
  | { kind: 'lcd'; lines: string[] }
  | { kind: 'log'; title: string; lines: string[] }
  | { kind: 'bar'; label: string; value: number; max: number; unit: string }
  | { kind: 'slots'; slots: boolean[]; gateOpen: boolean }
  | { kind: 'sms'; to: string; text: string; delivered: boolean };
export interface Output { readouts: { label: string; value: string }[]; visuals: Visual[] }
export interface Wire { a: string; b: string; why: string }
export interface Experiment {
  id: string; n: number; title: string; component: ComponentId; goal: string;
  pins: string[]; wires: Wire[]; controls: Control[]; steps: string[]; note?: string; code?: string;
  sim: (v: Values, tick: number, st: SimState, log: string[]) => Output;
  action?: (id: string, v: Values, st: SimState) => { state?: SimState; log?: string[] };
}

const N = (v: Values, k: string) => Number(v[k]);
const B = (v: Values, k: string) => Boolean(v[k]);
const S = (v: Values, k: string) => String(v[k]);
const blink = (tick: number, ms: number) => Math.floor((tick * 100) / Math.max(ms, 50)) % 2 === 0;
const hl = (b: boolean) => (b ? 'HIGH' : 'LOW');

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'led-blink', n: 1, title: 'LED blinking using Arduino', component: 'uno',
    goal: 'Make an LED blink by switching an Arduino pin HIGH and LOW.',
    pins: ['Arduino D13', 'Arduino GND', 'LED +', 'LED -'],
    wires: [{ a: 'Arduino D13', b: 'LED +', why: 'Pin D13 supplies the signal to the LED long leg (+).' }, { a: 'LED -', b: 'Arduino GND', why: 'The LED short leg (-) returns to ground to complete the circuit.' }],
    controls: [{ id: 'run', label: 'Program running', type: 'switch', def: true }, { id: 'ms', label: 'Blink interval', type: 'slider', min: 100, max: 1500, step: 50, unit: 'ms', def: 500 }],
    steps: ['Connect D13 to LED +.', 'Connect LED - to GND.', 'Change the interval slider and watch the LED.'],
    code: 'void loop() {\n  digitalWrite(13, HIGH); delay(500);\n  digitalWrite(13, LOW);  delay(500);\n}',
    sim: (v, t) => { const on = B(v, 'run') && blink(t, N(v, 'ms')); return { readouts: [{ label: 'Pin D13', value: hl(on) }, { label: 'Interval', value: `${N(v, 'ms')} ms` }], visuals: [{ kind: 'led', label: 'LED', on, level: 1, color: '#ef4444' }] }; },
  },
  {
    id: 'ultrasonic', n: 2, title: 'Ultrasonic distance measurement', component: 'ultrasonic',
    goal: 'Measure the distance to an object from the echo time.',
    pins: ['Arduino 5V', 'Arduino GND', 'Arduino D9', 'Arduino D10', 'Sensor VCC', 'Sensor GND', 'Sensor TRIG', 'Sensor ECHO'],
    wires: [{ a: 'Arduino 5V', b: 'Sensor VCC', why: 'The sensor needs power.' }, { a: 'Arduino GND', b: 'Sensor GND', why: 'Common ground.' }, { a: 'Arduino D9', b: 'Sensor TRIG', why: 'D9 sends the start pulse to TRIG.' }, { a: 'Arduino D10', b: 'Sensor ECHO', why: 'D10 reads the echo pulse from ECHO.' }],
    controls: [{ id: 'd', label: 'Object distance', type: 'slider', min: 2, max: 400, step: 1, unit: 'cm', def: 50 }],
    steps: ['Make the 4 connections.', 'Move the distance slider.', 'See the echo time and distance change.'],
    code: 'long t = pulseIn(10, HIGH);\nfloat cm = t / 58.0;',
    sim: (v) => { const d = N(v, 'd'); return { readouts: [{ label: 'Echo time (simulated)', value: `${Math.round(d * 58)} µs` }, { label: 'Distance (simulated)', value: `${d} cm` }], visuals: [{ kind: 'bar', label: 'Distance', value: d, max: 400, unit: 'cm' }] }; },
  },
  {
    id: 'temperature', n: 3, title: 'Temperature monitoring', component: 'temperature',
    goal: 'Read a temperature sensor on an analog pin.',
    pins: ['Sensor AOUT', 'Sensor GND', 'Arduino A0', 'Arduino GND'],
    wires: [{ a: 'Sensor AOUT', b: 'Arduino A0', why: 'The analog output goes to analog input A0.' }, { a: 'Sensor GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 't', label: 'Temperature', type: 'slider', min: 0, max: 100, step: 1, unit: '°C', def: 28 }],
    steps: ['Connect AOUT to A0 and GND to GND.', 'Move the temperature slider.', 'Watch the reading change.'],
    note: 'Simplified: the reading is scaled 0-1023 across 0-100 °C. A real sensor needs its datasheet formula.',
    sim: (v) => { const t = N(v, 't'); const adc = Math.round((t / 100) * 1023); return { readouts: [{ label: 'Temperature (simulated)', value: `${t} °C` }, { label: 'A0 reading (simulated)', value: String(adc) }, { label: 'Status', value: t < 20 ? 'Cold' : t < 35 ? 'Normal' : 'Hot' }], visuals: [{ kind: 'bar', label: 'Temperature', value: t, max: 100, unit: '°C' }, { kind: 'led', label: 'Hot alarm LED', on: t >= 35, level: 1, color: '#f97316' }] }; },
  },
  {
    id: 'dht11', n: 4, title: 'DHT11 temperature and humidity', component: 'dht11',
    goal: 'Read temperature and humidity from one data pin.',
    pins: ['DHT11 DOUT', 'DHT11 VCC', 'DHT11 GND', 'Arduino D2', 'Arduino 5V', 'Arduino GND'],
    wires: [{ a: 'DHT11 DOUT', b: 'Arduino D2', why: 'The data pin goes to digital pin D2.' }, { a: 'DHT11 VCC', b: 'Arduino 5V', why: 'Power for the sensor.' }, { a: 'DHT11 GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 't', label: 'Temperature', type: 'slider', min: 0, max: 50, step: 1, unit: '°C', def: 28 }, { id: 'h', label: 'Humidity', type: 'slider', min: 20, max: 90, step: 1, unit: '%', def: 60 }],
    steps: ['Make the 3 connections.', 'Move both sliders.', 'Read the values.'],
    sim: (v) => { const t = N(v, 't'), h = N(v, 'h'); return { readouts: [{ label: 'Temperature (simulated)', value: `${t} °C` }, { label: 'Humidity (simulated)', value: `${h} %` }, { label: 'Comfort', value: h > 70 ? 'Humid' : h < 30 ? 'Dry' : 'Comfortable' }], visuals: [{ kind: 'bar', label: 'Temperature', value: t, max: 50, unit: '°C' }, { kind: 'bar', label: 'Humidity', value: h, max: 100, unit: '%' }] }; },
  },
  {
    id: 'ir', n: 5, title: 'IR object detection', component: 'ir',
    goal: 'Detect a nearby object using an infrared sensor.',
    pins: ['IR OUT', 'IR VCC', 'IR GND', 'Arduino D7', 'Arduino 5V', 'Arduino GND'],
    wires: [{ a: 'IR OUT', b: 'Arduino D7', why: 'The detection signal goes to input D7.' }, { a: 'IR VCC', b: 'Arduino 5V', why: 'Power.' }, { a: 'IR GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 'd', label: 'Object distance', type: 'slider', min: 0, max: 30, step: 1, unit: 'cm', def: 25 }, { id: 's', label: 'Sensitivity (trimmer)', type: 'slider', min: 5, max: 25, step: 1, unit: 'cm', def: 12 }],
    steps: ['Make the 3 connections.', 'Move the object closer than the sensitivity distance.', 'See the detection light turn on.'],
    sim: (v) => { const hit = N(v, 'd') <= N(v, 's'); return { readouts: [{ label: 'Object detected (simulated)', value: hit ? 'YES' : 'NO' }, { label: 'Pin D7', value: hl(hit) }], visuals: [{ kind: 'led', label: 'Detect LED', on: hit, level: 1, color: '#22c55e' }] }; },
  },
  {
    id: 'buzzer', n: 6, title: 'Buzzer alarm', component: 'buzzer',
    goal: 'Sound an alarm with a buzzer.',
    pins: ['Arduino D8', 'Arduino GND', 'Buzzer BUZ', 'Buzzer GND'],
    wires: [{ a: 'Arduino D8', b: 'Buzzer BUZ', why: 'D8 switches the buzzer.' }, { a: 'Arduino GND', b: 'Buzzer GND', why: 'Common ground.' }],
    controls: [{ id: 'on', label: 'Alarm', type: 'switch', def: false }, { id: 'ms', label: 'Beep interval', type: 'slider', min: 100, max: 1000, step: 50, unit: 'ms', def: 300 }],
    steps: ['Make the 2 connections.', 'Switch the alarm ON.', 'Change the beep interval.'],
    code: 'digitalWrite(8, HIGH); delay(300);\ndigitalWrite(8, LOW);  delay(300);',
    sim: (v, t) => { const on = B(v, 'on') && blink(t, N(v, 'ms')); return { readouts: [{ label: 'Alarm switch', value: B(v, 'on') ? 'ON' : 'OFF' }, { label: 'Pin D8', value: hl(on) }], visuals: [{ kind: 'buzzer', on }] }; },
  },
  {
    id: 'pot-led', n: 7, title: 'Potentiometer LED brightness', component: 'potentiometer',
    goal: 'Use a knob to change LED brightness.',
    pins: ['Pot OUT', 'Arduino A0', 'Arduino D9 (PWM)', 'LED +', 'LED -', 'Arduino GND'],
    wires: [{ a: 'Pot OUT', b: 'Arduino A0', why: 'The knob voltage is read on A0.' }, { a: 'Arduino D9 (PWM)', b: 'LED +', why: 'D9 can send PWM to dim the LED.' }, { a: 'LED -', b: 'Arduino GND', why: 'Completes the LED circuit.' }],
    controls: [{ id: 'p', label: 'Knob position', type: 'slider', min: 0, max: 100, step: 1, unit: '%', def: 50 }],
    steps: ['Make the 3 connections.', 'Turn the knob (slider).', 'Watch the brightness.'],
    code: 'int v = analogRead(A0);\nanalogWrite(9, v / 4);',
    sim: (v) => { const adc = Math.round((N(v, 'p') / 100) * 1023); const pwm = Math.round((adc / 1023) * 255); return { readouts: [{ label: 'A0 reading (simulated)', value: String(adc) }, { label: 'PWM on D9', value: `${pwm} / 255` }], visuals: [{ kind: 'led', label: 'LED', on: pwm > 0, level: pwm / 255, color: '#facc15' }, { kind: 'bar', label: 'Brightness', value: pwm, max: 255, unit: '' }] }; },
  },
  {
    id: 'relay', n: 8, title: 'Relay switching', component: 'relay',
    goal: 'Switch a load with a relay.',
    pins: ['Arduino D4', 'Arduino GND', 'Relay RLY-1', 'Relay GND'],
    wires: [{ a: 'Arduino D4', b: 'Relay RLY-1', why: 'D4 controls the relay coil.' }, { a: 'Arduino GND', b: 'Relay GND', why: 'Common ground.' }],
    controls: [{ id: 'on', label: 'D4 output HIGH', type: 'switch', def: false }],
    steps: ['Make the 2 connections.', 'Switch D4 ON and OFF.', 'Watch the relay and the lamp.'],
    note: 'Safety: only use low-voltage loads under teacher supervision. Never connect mains electricity.',
    code: 'digitalWrite(4, HIGH); // relay ON',
    sim: (v) => { const on = B(v, 'on'); return { readouts: [{ label: 'Relay coil', value: on ? 'ENERGISED (click)' : 'OFF' }, { label: 'Load', value: on ? 'ON' : 'OFF' }], visuals: [{ kind: 'relay', on }, { kind: 'led', label: 'Load lamp', on, level: 1, color: '#fde047' }] }; },
  },
  {
    id: 'lcd', n: 9, title: 'LCD text display', component: 'lcd',
    goal: 'Show text on the LCD.',
    pins: ['Arduino D13', 'Arduino D11', 'Arduino D10', 'LCD SCK', 'LCD MOSI', 'LCD CS'],
    wires: [{ a: 'Arduino D13', b: 'LCD SCK', why: 'D13 provides the clock.' }, { a: 'Arduino D11', b: 'LCD MOSI', why: 'D11 sends data to the screen.' }, { a: 'Arduino D10', b: 'LCD CS', why: 'D10 selects the screen.' }],
    controls: [{ id: 'l1', label: 'Line 1', type: 'text', def: 'Hello IoT!', maxLen: 16 }, { id: 'l2', label: 'Line 2', type: 'text', def: 'Class 10-12', maxLen: 16 }],
    steps: ['Make the 3 connections.', 'Type text for the two lines.', 'See it on the screen.'],
    note: 'Example wiring for this simulator. Real pin choices depend on your display library.',
    sim: (v) => ({ readouts: [{ label: 'Characters sent', value: String(S(v, 'l1').length + S(v, 'l2').length) }], visuals: [{ kind: 'lcd', lines: [S(v, 'l1'), S(v, 'l2')] }] }),
  },
  {
    id: 'bluetooth', n: 10, title: 'Bluetooth communication', component: 'bluetooth',
    goal: 'Control an LED from a phone with text commands.',
    pins: ['BT TXD', 'BT RXD', 'BT 5V', 'Arduino D0 (RX)', 'Arduino D1 (TX)', 'Arduino 5V'],
    wires: [{ a: 'BT TXD', b: 'Arduino D0 (RX)', why: 'Module transmit goes to Arduino receive.' }, { a: 'BT RXD', b: 'Arduino D1 (TX)', why: 'Module receive goes to Arduino transmit.' }, { a: 'BT 5V', b: 'Arduino 5V', why: 'Power.' }],
    controls: [{ id: 'cmd', label: 'Phone command (ON or OFF)', type: 'text', def: 'ON', maxLen: 12 }, { id: 'send', label: 'Send from phone', type: 'button', def: false }],
    steps: ['Make the 3 connections.', 'Type ON or OFF.', 'Press Send from phone.'],
    action: (_id, v, st) => { const c = S(v, 'cmd').trim().toUpperCase(); if (c === 'ON') return { state: { ...st, led: true }, log: [`Phone: "${c}"`, 'Arduino: LED turned ON'] }; if (c === 'OFF') return { state: { ...st, led: false }, log: [`Phone: "${c}"`, 'Arduino: LED turned OFF'] }; return { log: [`Phone: "${c}"`, 'Arduino: unknown command'] }; },
    sim: (_v, _t, st, log) => ({ readouts: [{ label: 'LED state', value: st.led ? 'ON' : 'OFF' }], visuals: [{ kind: 'led', label: 'LED', on: Boolean(st.led), level: 1, color: '#38bdf8' }, { kind: 'log', title: 'Serial messages (simulated)', lines: log }] }),
  },
  {
    id: 'esp8266', n: 11, title: 'ESP8266 Wi-Fi communication', component: 'esp8266',
    goal: 'Send a sensor reading over Wi-Fi.',
    pins: ['ESP TX', 'ESP RX', 'ESP 3V3', 'ESP GND', 'Arduino D2', 'Arduino D3', 'Arduino 3V3', 'Arduino 5V', 'Arduino GND'],
    wires: [{ a: 'ESP TX', b: 'Arduino D2', why: 'Module transmit goes to an Arduino receive pin.' }, { a: 'ESP RX', b: 'Arduino D3', why: 'Module receive goes to an Arduino transmit pin.' }, { a: 'ESP 3V3', b: 'Arduino 3V3', why: 'The ESP8266 works at 3.3 V.' }, { a: 'ESP GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 'wifi', label: 'Wi-Fi network available', type: 'switch', def: true }, { id: 't', label: 'Temperature to send', type: 'slider', min: 0, max: 50, step: 1, unit: '°C', def: 30 }, { id: 'send', label: 'Send reading', type: 'button', def: false }],
    steps: ['Make the 4 connections.', 'Press Send reading.', 'Switch Wi-Fi off and try again.'],
    note: 'Simulated only. No real Wi-Fi connection is made.',
    action: (_id, v) => B(v, 'wifi') ? { log: ['Joined Wi-Fi (simulated)', `POST temp=${N(v, 't')}`, 'Server reply: 200 OK (simulated)'] } : { log: ['No Wi-Fi: cannot send (simulated)'] },
    sim: (v, _t, _s, log) => ({ readouts: [{ label: 'Wi-Fi', value: B(v, 'wifi') ? 'Available' : 'Off' }], visuals: [{ kind: 'log', title: 'ESP8266 messages (simulated)', lines: log }] }),
  },
  {
    id: 'gsm', n: 12, title: 'GSM SMS simulation', component: 'sim800c',
    goal: 'Send an SMS with AT commands.',
    pins: ['SIM800C TX', 'SIM800C RX', 'SIM800C GND', 'Arduino D2', 'Arduino D3', 'Arduino GND'],
    wires: [{ a: 'SIM800C TX', b: 'Arduino D2', why: 'Module transmit goes to Arduino receive.' }, { a: 'SIM800C RX', b: 'Arduino D3', why: 'Module receive goes to Arduino transmit.' }, { a: 'SIM800C GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 'to', label: 'Phone number', type: 'text', def: '9876500000', maxLen: 15 }, { id: 'msg', label: 'Message', type: 'text', def: 'Hello from IoT kit', maxLen: 40 }, { id: 'send', label: 'Send SMS', type: 'button', def: false }],
    steps: ['Make the 3 connections.', 'Type a number and message.', 'Press Send SMS.'],
    note: 'Simulated only. No real SMS is sent.',
    action: (_id, v, st) => ({ state: { ...st, to: S(v, 'to'), text: S(v, 'msg'), sent: true }, log: ['AT -> OK', 'AT+CMGF=1 -> OK', `AT+CMGS="${S(v, 'to')}"`, S(v, 'msg'), '+CMGS: OK (simulated)'] }),
    sim: (_v, _t, st, log) => ({ readouts: [{ label: 'SMS status', value: st.sent ? 'Sent (simulated)' : 'Not sent' }], visuals: [{ kind: 'sms', to: String(st.to ?? ''), text: String(st.text ?? ''), delivered: Boolean(st.sent) }, { kind: 'log', title: 'AT commands (simulated)', lines: log }] }),
  },
  {
    id: 'lora', n: 13, title: 'LoRaWAN data transmission', component: 'lora',
    goal: 'Send a small data packet over a long distance.',
    pins: ['LoRa TXD', 'LoRa RXD', 'LoRa GND', 'Arduino D2', 'Arduino D3', 'Arduino GND'],
    wires: [{ a: 'LoRa TXD', b: 'Arduino D2', why: 'Module transmit goes to Arduino receive.' }, { a: 'LoRa RXD', b: 'Arduino D3', why: 'Module receive goes to Arduino transmit.' }, { a: 'LoRa GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 'val', label: 'Sensor value', type: 'slider', min: 0, max: 100, step: 1, def: 42 }, { id: 'km', label: 'Distance to gateway', type: 'slider', min: 1, max: 10, step: 1, unit: 'km', def: 2 }, { id: 'send', label: 'Send uplink', type: 'button', def: false }],
    steps: ['Make the 3 connections.', 'Choose a value and distance.', 'Press Send uplink.'],
    note: 'Simplified simulation: packets are lost if the gateway is too far. Real range depends on the area.',
    action: (_id, v, st) => { const n = Number(st.count ?? 0) + 1; const km = N(v, 'km'); const hex = N(v, 'val').toString(16).padStart(2, '0').toUpperCase(); const q = km <= 3 ? 'Good' : km <= 7 ? 'Fair' : 'Poor'; return { state: { ...st, count: n, q }, log: [`Uplink #${n} payload 0x${hex}`, km > 8 ? 'No reply: packet lost (simulated)' : `Gateway received it. Link: ${q} (simulated)`] }; },
    sim: (_v, _t, st, log) => ({ readouts: [{ label: 'Packets sent', value: String(st.count ?? 0) }, { label: 'Last link quality', value: String(st.q ?? '-') }], visuals: [{ kind: 'log', title: 'LoRa messages (simulated)', lines: log }] }),
  },
  {
    id: 'xbee', n: 14, title: 'XBee wireless communication', component: 'xbee',
    goal: 'Send a message from one XBee node to another.',
    pins: ['XBee DOUT', 'XBee DIN', 'XBee GND', 'Arduino D2', 'Arduino D3', 'Arduino GND'],
    wires: [{ a: 'XBee DOUT', b: 'Arduino D2', why: 'Radio data out goes to an Arduino receive pin.' }, { a: 'XBee DIN', b: 'Arduino D3', why: 'Data in comes from an Arduino transmit pin.' }, { a: 'XBee GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 'msg', label: 'Message', type: 'text', def: 'Hi Node B', maxLen: 30 }, { id: 'm', label: 'Distance between nodes', type: 'slider', min: 1, max: 150, step: 1, unit: 'm', def: 20 }, { id: 'send', label: 'Send', type: 'button', def: false }],
    steps: ['Make the 3 connections.', 'Type a message.', 'Press Send, then move the nodes far apart and try again.'],
    note: 'Simplified: this simulation uses a 100 m limit. Real range depends on the module and surroundings.',
    action: (_id, v) => N(v, 'm') <= 100 ? { log: [`Node A sent: "${S(v, 'msg')}"`, `Node B received: "${S(v, 'msg')}"`] } : { log: [`Node A sent: "${S(v, 'msg')}"`, 'Node B: nothing received (too far)'] },
    sim: (_v, _t, _s, log) => ({ readouts: [], visuals: [{ kind: 'log', title: 'XBee messages (simulated)', lines: log }] }),
  },
  {
    id: 'parking', n: 15, title: 'Smart parking system', component: 'ir',
    goal: 'Count free parking slots with IR sensors.',
    pins: ['IR1 OUT', 'IR2 OUT', 'IR GND', 'Arduino D2', 'Arduino D3', 'Arduino GND'],
    wires: [{ a: 'IR1 OUT', b: 'Arduino D2', why: 'Slot 1 sensor goes to D2.' }, { a: 'IR2 OUT', b: 'Arduino D3', why: 'Slot 2 sensor goes to D3.' }, { a: 'IR GND', b: 'Arduino GND', why: 'Common ground.' }],
    controls: [{ id: 'c1', label: 'Car in slot 1', type: 'switch', def: false }, { id: 'c2', label: 'Car in slot 2', type: 'switch', def: false }],
    steps: ['Make the 3 connections.', 'Park cars with the switches.', 'Watch the free count and the gate.'],
    sim: (v) => { const slots = [B(v, 'c1'), B(v, 'c2')]; const free = slots.filter((s) => !s).length; return { readouts: [{ label: 'Free slots', value: `${free} / 2` }, { label: 'Display', value: free ? 'WELCOME' : 'FULL' }], visuals: [{ kind: 'slots', slots, gateOpen: free > 0 }] }; },
  },
];

/* ---------- virtual wiring validation ---------- */
export type Conn = [string, string];
export interface WireMessage { type: 'ok' | 'warn' | 'error'; text: string }
const key = (a: string, b: string) => [a, b].sort().join('|');
const isPower = (p: string) => /(5V|3V3)/.test(p);
const isGnd = (p: string) => /GND/.test(p);

export function validateWiring(exp: Experiment, conns: Conn[]) {
  const msgs: WireMessage[] = [];
  const made = new Set<string>();
  let short = false;
  for (const [a, b] of conns) {
    const w = exp.wires.find((x) => key(x.a, x.b) === key(a, b));
    if (w) { made.add(key(a, b)); msgs.push({ type: 'ok', text: `${a} ↔ ${b}: correct. ${w.why}` }); continue; }
    if ((isPower(a) && isGnd(b)) || (isPower(b) && isGnd(a))) { short = true; msgs.push({ type: 'error', text: `${a} ↔ ${b}: SHORT CIRCUIT. Power must never touch ground directly.` }); continue; }
    if ((/ESP/.test(a) && /3V3/.test(a) && /Arduino 5V/.test(b)) || (/ESP/.test(b) && /3V3/.test(b) && /Arduino 5V/.test(a))) { msgs.push({ type: 'error', text: `${a} ↔ ${b}: the ESP8266 works at 3.3 V. 5 V can damage it.` }); short = true; continue; }
    if ((/TX/.test(a) && /TX/.test(b)) || (/RX/.test(a) && /RX/.test(b))) { msgs.push({ type: 'error', text: `${a} ↔ ${b}: TX must connect to RX, and RX to TX.` }); continue; }
    msgs.push({ type: 'warn', text: `${a} ↔ ${b}: not needed in this experiment. Check the steps.` });
  }
  const missing = exp.wires.filter((w) => !made.has(key(w.a, w.b)));
  return { ok: missing.length === 0 && !short, missing, msgs };
}
