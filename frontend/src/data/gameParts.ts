/** Parts used by the Part Match game and the home-page parts strip. `img` is a file in public/components. */
export interface GamePart { id: string; img: string; name: string; clue: string; tint: string }

export const GAME_PARTS: GamePart[] = [
  { id: 'uno', img: 'arduino-uno', name: 'Arduino Uno', clue: 'The brain of the circuit', tint: '#bbf7d0' },
  { id: 'dht', img: 'dht11', name: 'DHT11', clue: 'Senses heat & humidity', tint: '#bae6fd' },
  { id: 'soil', img: 'soil', name: 'Soil Sensor', clue: 'Checks how wet soil is', tint: '#fde68a' },
  { id: 'ldr', img: 'ldr', name: 'LDR', clue: 'Detects light level', tint: '#fed7aa' },
  { id: 'relay', img: 'relay', name: 'Relay', clue: 'Switches big loads', tint: '#fbcfe8' },
  { id: 'buzzer', img: 'buzzer', name: 'Buzzer', clue: 'Makes beep sounds', tint: '#ddd6fe' },
  { id: 'servo', img: 'servo', name: 'Servo Motor', clue: 'Turns to exact angles', tint: '#bbf7d0' },
  { id: 'lcd', img: 'lcd', name: 'LCD Display', clue: 'Shows text & numbers', tint: '#bae6fd' },
  { id: 'led', img: 'leds', name: 'LED', clue: 'Glows when powered', tint: '#fde68a' },
  { id: 'bt', img: 'hc05', name: 'HC-05', clue: 'Bluetooth link', tint: '#ddd6fe' },
  { id: 'wifi', img: 'esp8266', name: 'ESP8266', clue: 'Adds Wi-Fi to projects', tint: '#fed7aa' },
  { id: 'bread', img: 'breadboard', name: 'Breadboard', clue: 'Build with no soldering', tint: '#fbcfe8' },
  { id: 'pot', img: 'pot', name: 'Potentiometer', clue: 'A knob that changes values', tint: '#bbf7d0' },
  { id: 'res', img: 'resistors', name: 'Resistor', clue: 'Limits the current', tint: '#bae6fd' },
  { id: 'btn', img: 'buttons', name: 'Push Button', clue: 'Sends a press signal', tint: '#fde68a' },
];
