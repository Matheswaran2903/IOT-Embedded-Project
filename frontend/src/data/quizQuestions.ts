export interface QuizQuestion { q: string; options: [string, string, string, string]; answer: number; why: string }

export const QUIZ: QuizQuestion[] = [
  { q: 'Which component measures distance using sound waves?', options: ['IR Sensor', 'Ultrasonic Sensor', 'Potentiometer', 'Relay'], answer: 1, why: 'The ultrasonic sensor sends sound and times the echo.' },
  { q: 'An ultrasonic echo lasts 580 microseconds. What is the distance (time ÷ 58)?', options: ['5 cm', '20 cm', '10 cm', '58 cm'], answer: 2, why: '580 ÷ 58 = 10 cm.' },
  { q: 'What does a breadboard let you do?', options: ['Build circuits without soldering', 'Connect to the internet', 'Measure humidity', 'Make sound'], answer: 0, why: 'Metal strips inside connect the holes so parts can be pushed in.' },
  { q: 'Which board on the kit is a Raspberry Pi microcontroller with Wi-Fi?', options: ['Arduino UNO', 'ESP8266', 'Raspberry Pi Pico W', 'XBee'], answer: 2, why: 'The Pico W is the Raspberry Pi microcontroller with wireless.' },
  { q: 'A relay is best described as...', options: ['A light sensor', 'An electrically controlled switch', 'A display', 'A battery'], answer: 1, why: 'A small control signal switches a larger circuit.' },
  { q: 'What does the DHT11 measure?', options: ['Distance and speed', 'Light and sound', 'Temperature and humidity', 'Voltage and current'], answer: 2, why: 'The DHT11 gives temperature and humidity.' },
  { q: 'What happens when you turn a potentiometer knob?', options: ['Its resistance output changes', 'It starts Wi-Fi', 'It sends an SMS', 'It turns off the board'], answer: 0, why: 'The wiper moves and the output voltage changes.' },
  { q: 'What does the buzzer do?', options: ['Measures heat', 'Stores data', 'Makes a beep sound', 'Shows pictures'], answer: 2, why: 'The buzzer sounds when switched on.' },
  { q: 'An IR sensor detects objects using...', options: ['Magnets', 'Infrared light', 'Radio waves', 'Water'], answer: 1, why: 'It sends infrared light and looks for reflection.' },
  { q: 'The SIM800C GSM module is mainly used for...', options: ['Playing music', 'Measuring temperature', 'Sending SMS and making calls', 'Drawing graphics'], answer: 2, why: 'GSM modules use a SIM card for SMS and calls.' },
  { q: 'LoRaWAN is known for...', options: ['Long range with small data', 'Very fast video', 'Short wired links', 'High power use'], answer: 0, why: 'LoRaWAN sends small packets over long distances at low power.' },
  { q: 'Which module lets a phone talk to your project wirelessly over short range?', options: ['Relay', 'Bluetooth Module', 'Buzzer', 'Breadboard'], answer: 1, why: 'The Bluetooth module pairs with phones.' },
  { q: 'What supply voltage does an ESP8266 module use?', options: ['12 V', '230 V', '3.3 V', '24 V'], answer: 2, why: 'ESP8266 modules work at 3.3 V; 5 V can damage them.' },
  { q: 'The Arduino UNO is a...', options: ['Microcontroller board', 'Memory card', 'Camera', 'Speaker'], answer: 0, why: 'It is a microcontroller board that runs your sketch.' },
  { q: 'With PWM, a higher value on an LED pin makes the LED...', options: ['Dimmer', 'Brighter', 'Blink', 'Turn off'], answer: 1, why: 'More ON time gives more brightness.' },
  { q: 'What range of values does analogRead() give on an Arduino UNO?', options: ['0 to 10', '0 to 255', '0 to 100', '0 to 1023'], answer: 3, why: 'The UNO uses a 10-bit converter: 0 to 1023.' },
  { q: 'When wiring serial devices, the TX pin of one device connects to...', options: ['TX of the other', 'RX of the other', 'GND only', '5V'], answer: 1, why: 'Transmit goes to receive.' },
  { q: 'In the Virtual Lab, the outputs shown are...', options: ['Real hardware readings', 'Real SMS messages', 'Simulated values', 'Internet data'], answer: 2, why: 'Everything in the lab is simulated in your browser.' },
  { q: 'Which part of the kit is used to show text on a screen?', options: ['LCD Display', 'Relay', 'Buzzer', 'Probe Tester'], answer: 0, why: 'The LCD shows text and graphics.' },
  { q: 'In the smart parking experiment, what detects a car in a slot?', options: ['Buzzer', 'Potentiometer', 'IR Sensor', 'XBee'], answer: 2, why: 'An IR sensor sees a nearby object.' },
];
