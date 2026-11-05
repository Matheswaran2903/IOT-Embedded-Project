import type { KitComponent } from '../types';
import { px } from '../utils/coords';

/** Positions/sizes measured from the uploaded top-view photo of the kit. */
export const KIT_COMPONENTS: KitComponent[] = [
  { id: 'ultrasonic', name: 'Ultrasonic Sensor', kind: 'sensor', summary: 'Measures distance using sound waves (two round transducers).', position: px(250, 272), size: [2.5, 0.9, 1.2] },
  { id: 'breadboard', name: 'Breadboard', kind: 'prototyping', summary: 'A solderless board for building and testing circuits.', position: px(268, 985), size: [3.45, 0.25, 4.3] },
  { id: 'pico', name: 'Raspberry Pi Pico W', kind: 'board', summary: 'A small microcontroller board with Wi-Fi.', position: px(967, 1055), size: [2.5, 0.25, 1.0] },
  { id: 'uno', name: 'Arduino UNO', kind: 'board', summary: 'A popular microcontroller board for learning electronics.', position: px(1015, 795), size: [3.4, 0.7, 2.6] },
  { id: 'esp8266', name: 'ESP8266', kind: 'wireless', summary: 'A small Wi-Fi module (ESP-01 style) for internet projects.', position: px(1077, 1215), size: [1.15, 0.3, 0.75] },
  { id: 'probe', name: 'Probe Tester', kind: 'interface', summary: 'Header area for connecting a probe or test wire.', position: px(905, 560), size: [0.7, 0.3, 1.1] },
  { id: 'lcd', name: 'LCD Display', kind: 'display', summary: 'A small colour screen that shows text and graphics.', position: px(722, 792), size: [1.7, 0.3, 2.8] },
  { id: 'sim800c', name: 'SIM800C GSM Module', kind: 'wireless', summary: 'A GSM module for calls and SMS using a SIM card.', position: px(745, 1265), size: [1.8, 0.5, 2.4] },
  { id: 'xbee', name: 'XBee Interface', kind: 'wireless', summary: 'A socket for an XBee radio module for wireless data.', position: px(490, 393), size: [1.3, 0.4, 2.1] },
  { id: 'lora', name: 'LoRaWAN Interface', kind: 'wireless', summary: 'A socket holding a LoRaWAN module for long-range, low-power data.', position: px(458, 642), size: [1.4, 0.4, 2.4] },
  { id: 'potentiometer', name: 'Potentiometer', kind: 'input', summary: 'A turning knob whose resistance changes as you rotate it.', position: px(470, 1300), size: [1.2, 0.8, 2.1] },
  { id: 'relay', name: 'Relay', kind: 'actuator', summary: 'An electrically controlled switch (two relays with screw terminals).', position: px(228, 1280), size: [2.2, 0.8, 2.2] },
  { id: 'buzzer', name: 'Buzzer', kind: 'actuator', summary: 'Makes a beep sound when it is switched on.', position: px(225, 725), size: [0.8, 0.45, 0.8] },
  { id: 'ir', name: 'IR Sensor', kind: 'sensor', summary: 'Detects nearby objects using infrared light.', position: px(195, 545), size: [1.7, 0.6, 0.8] },
  { id: 'temperature', name: 'Temperature Sensor', kind: 'sensor', summary: 'A small sensor that gives a signal based on temperature.', position: px(320, 455), size: [1.0, 0.4, 0.7] },
  { id: 'dht11', name: 'Temperature/RH Sensor (DHT11)', kind: 'sensor', summary: 'Measures temperature and humidity (blue DHT11 sensor).', position: px(150, 410), size: [0.7, 0.4, 0.9] },
  { id: 'generalio', name: 'General I/O', kind: 'input', summary: 'Push buttons, slide switches and indicators for simple inputs and outputs.', position: px(465, 1060), size: [1.9, 0.4, 2.0] },
  { id: 'bluetooth', name: 'Bluetooth Module', kind: 'wireless', summary: 'A module that talks to phones and other devices over Bluetooth.', position: px(710, 545), size: [2.4, 0.4, 0.8] },
];

export const getComponent = (id: string) => KIT_COMPONENTS.find((c) => c.id === id);

export const KIND_LABEL: Record<string, string> = {
  board: 'Microcontroller board', sensor: 'Sensor', actuator: 'Output device', wireless: 'Wireless / communication',
  display: 'Display', interface: 'Interface', input: 'Input', prototyping: 'Prototyping',
};
