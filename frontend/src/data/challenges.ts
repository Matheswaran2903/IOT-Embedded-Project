export type Challenge =
  | { id: string; title: string; question: string; hint: string; type: 'number'; answer: number; tol: number; why: string }
  | { id: string; title: string; question: string; hint: string; type: 'choice'; options: string[]; answer: number; why: string };

export const CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Echo to distance', question: 'An ultrasonic echo lasts 1160 microseconds. How many cm away is the object? (time ÷ 58)', hint: 'Divide 1160 by 58.', type: 'number', answer: 20, tol: 0.5, why: '1160 ÷ 58 = 20 cm.' },
  { id: 'c2', title: 'Distance to echo', question: 'An object is 100 cm away. What echo time (in microseconds) do you expect? (time = cm × 58)', hint: 'Multiply 100 by 58.', type: 'number', answer: 5800, tol: 1, why: '100 × 58 = 5800 µs.' },
  { id: 'c3', title: 'Knob to ADC', question: 'A potentiometer is turned to 25 %. What is the analog reading (0-1023)?', hint: '0.25 × 1023', type: 'number', answer: 256, tol: 1, why: '0.25 × 1023 ≈ 256.' },
  { id: 'c4', title: 'ADC to PWM', question: 'The analog reading is 512. What PWM value (0-255) matches it?', hint: '512 ÷ 1023 × 255', type: 'number', answer: 128, tol: 1, why: '512 ÷ 1023 × 255 ≈ 128.' },
  { id: 'c5', title: 'Blink rate', question: 'An LED is ON for 500 ms and OFF for 500 ms. How many full blinks per second?', hint: 'One blink takes 1000 ms.', type: 'number', answer: 1, tol: 0, why: 'One full ON+OFF cycle is 1000 ms, so 1 blink per second.' },
  { id: 'c6', title: 'Beep rate', question: 'A buzzer is ON for 250 ms and OFF for 250 ms. How many beeps per second?', hint: 'One beep cycle takes 500 ms.', type: 'number', answer: 2, tol: 0, why: '1000 ÷ 500 = 2 beeps per second.' },
  { id: 'c7', title: 'Free parking', question: 'A parking area has 2 slots and 1 car is parked. How many slots are free?', hint: '2 minus 1.', type: 'number', answer: 1, tol: 0, why: '2 - 1 = 1 slot free.' },
  { id: 'c8', title: 'Safe ESP voltage', question: 'Which supply voltage should you give an ESP8266 module?', hint: 'It is a low-voltage module.', type: 'choice', options: ['12 V', '5 V', '3.3 V', '230 V'], answer: 2, why: 'ESP8266 modules use 3.3 V.' },
  { id: 'c9', title: 'Serial wiring', question: 'Module TX should be connected to which pin of the Arduino?', hint: 'Transmit talks to receive.', type: 'choice', options: ['An RX pin', 'A TX pin', '5V', 'Nothing'], answer: 0, why: 'TX connects to RX, and RX connects to TX.' },
  { id: 'c10', title: 'Relay job', question: 'What does a relay do?', hint: 'Think of a remote-controlled switch.', type: 'choice', options: ['Measures humidity', 'Switches a circuit on or off', 'Shows text', 'Stores data'], answer: 1, why: 'A relay is an electrically controlled switch.' },
];
