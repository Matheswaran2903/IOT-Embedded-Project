// Circuit Simulation Lab data: parts, correct wires, error-free Arduino code and live behaviour.
export interface PartDef { id: string; label: string; icon: string; pins: string[]; color?: string }
export interface SimInput { id: string; label: string; type: 'range' | 'toggle' | 'press'; min?: number; max?: number; step?: number; unit?: string; def: number }
export interface SimOut { leds?: Record<string, number>; buzzer?: boolean; lcd?: [string, string]; relay?: boolean; note?: string }
export interface Ctx { t: number; since: number }
export type Wire = [string, string, string]; // [pinA, pinB, why]
export interface SimProject {
  id: string; no: number; title: string; level: 'Beginner' | 'Intermediate'; emoji: string; image?: string; goal: string;
  parts: PartDef[]; wires: Wire[]; inputs: SimInput[]; libs?: string[];
  run: (v: Record<string, number>, c: Ctx) => SimOut; code: string;
}
export const UNO_PINS = ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', '5V', 'GND'];

const w = (a: string, b: string, why: string): Wire => [a, b, why];
const pwr = (p: string): Wire => w('UNO.5V', `${p}`, 'Power: gives the part 5 V');
const gnd = (p: string): Wire => w('UNO.GND', `${p}`, 'Ground: the return path for current');
const lcdWires = (): Wire[] => [pwr('lcd.VCC'), gnd('lcd.GND'), w('UNO.A4', 'lcd.SDA', 'I2C data line (SDA = A4 on Uno)'), w('UNO.A5', 'lcd.SCL', 'I2C clock line (SCL = A5 on Uno)')];
const LCD: PartDef = { id: 'lcd', label: '16×2 I2C LCD', icon: '🖥️', pins: ['GND', 'VCC', 'SDA', 'SCL'] };
const BUZ: PartDef = { id: 'buz', label: 'Buzzer', icon: '🔔', pins: ['+', '−'] };
const US: PartDef = { id: 'us', label: 'HC-SR04 Ultrasonic', icon: '📡', pins: ['VCC', 'TRIG', 'ECHO', 'GND'] };
const DHT: PartDef = { id: 'dht', label: 'DHT11 Temp & Humidity', icon: '💧', pins: ['VCC', 'DATA', 'GND'] };
const pad = (s: string) => s.padEnd(16, ' ').slice(0, 16);
const seq = (t: number, p: number[]) => { const total = p.reduce((a, b) => a + b, 0); let x = t % total; for (let i = 0; i < p.length; i++) { if (x < p[i]) return i % 2 === 0; x -= p[i]; } return false; };
const trunc = Math.trunc;

export const SIM_PROJECTS: SimProject[] = [
  { id: 'led', no: 0, title: 'LED Blink (first circuit)', level: 'Beginner', emoji: '💡', goal: 'Light an LED from pin D13. The LED module already includes its 220 Ω resistor.',
    parts: [{ id: 'led', label: 'Red LED + 220 Ω', icon: '🔴', pins: ['+', '−'], color: '#ef4444' }],
    wires: [w('UNO.D13', 'led.+', 'Signal: D13 sends HIGH/LOW to the LED anode (+)'), gnd('led.−')], inputs: [],
    run: (_v, c) => ({ leds: { led: c.t % 2 < 1 ? 1 : 0 }, note: 'LED blinks: 1 s ON, 1 s OFF' }),
    code: `const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}
` },
  { id: 'ultra', no: 2, title: 'Ultrasonic Distance Alert', level: 'Beginner', emoji: '📡', image: 'c02', goal: 'Sound a buzzer when an object comes closer than 20 cm.',
    parts: [US, BUZ],
    wires: [pwr('us.VCC'), gnd('us.GND'), w('UNO.D9', 'us.TRIG', 'Trigger: Arduino sends the ultrasonic pulse'), w('UNO.D10', 'us.ECHO', 'Echo: Arduino measures the returning pulse'), w('UNO.D8', 'buz.+', 'Signal: D8 drives the buzzer'), gnd('buz.−')],
    inputs: [{ id: 'dist', label: 'Object distance', type: 'range', min: 2, max: 200, step: 1, unit: 'cm', def: 80 }],
    run: v => ({ buzzer: v.dist > 0 && v.dist <= 20, note: `Distance = ${v.dist} cm` }),
    code: `const int trigPin = 9;
const int echoPin = 10;
const int buzzer = 8;

long duration;
int distance;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzer, OUTPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH, 30000);
  distance = duration * 0.034 / 2;

  if (distance > 0 && distance <= 20) {
    digitalWrite(buzzer, HIGH);
  } else {
    digitalWrite(buzzer, LOW);
  }
  delay(100);
}
` },
  { id: 'ir', no: 4, title: 'IR Sensor + LED + Buzzer', level: 'Beginner', emoji: '👁️', image: 'c04', goal: 'Detect an object with an IR sensor, then light an LED and sound a buzzer.',
    parts: [{ id: 'ir', label: 'IR Obstacle Sensor', icon: '👁️', pins: ['VCC', 'GND', 'OUT'] }, { id: 'led', label: 'Red LED + 220 Ω', icon: '🔴', pins: ['+', '−'], color: '#ef4444' }, BUZ],
    wires: [pwr('ir.VCC'), gnd('ir.GND'), w('UNO.D2', 'ir.OUT', 'Signal: OUT goes LOW when an object is detected'), w('UNO.D3', 'led.+', 'Signal: D3 lights the LED'), gnd('led.−'), w('UNO.D8', 'buz.+', 'Signal: D8 drives the buzzer'), gnd('buz.−')],
    inputs: [{ id: 'obj', label: 'Object in front of sensor', type: 'toggle', def: 0 }],
    run: v => ({ leds: { led: v.obj ? 1 : 0 }, buzzer: !!v.obj, note: v.obj ? 'Object Detected!' : 'No Object Detected' }),
    code: `// Pins follow the circuit diagram: IR OUT=D2, LED=D3, Buzzer=D8
const int irSensor = 2;
const int led = 3;
const int buzzer = 8;

void setup() {
  pinMode(irSensor, INPUT);
  pinMode(led, OUTPUT);
  pinMode(buzzer, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = digitalRead(irSensor);

  if (sensorValue == LOW) {          // LOW = object detected
    digitalWrite(led, HIGH);
    digitalWrite(buzzer, HIGH);
    Serial.println("Object Detected!");
  } else {
    digitalWrite(led, LOW);
    digitalWrite(buzzer, LOW);
    Serial.println("No Object Detected");
  }
  delay(200);
}
` },
  { id: 'parking', no: 6, title: 'Parking Distance Alert', level: 'Intermediate', emoji: '🚗', image: 'c06', goal: 'Show the distance on an LCD and beep faster as an object gets closer.',
    parts: [US, LCD, BUZ], libs: ['LiquidCrystal_I2C (Library Manager)'],
    wires: [pwr('us.VCC'), gnd('us.GND'), w('UNO.D9', 'us.TRIG', 'Trigger pulse'), w('UNO.D10', 'us.ECHO', 'Echo pulse'), ...lcdWires(), w('UNO.D8', 'buz.+', 'Signal: D8 drives the buzzer'), gnd('buz.−')],
    inputs: [{ id: 'dist', label: 'Object distance', type: 'range', min: 2, max: 150, step: 1, unit: 'cm', def: 60 }],
    run: (v, c) => { const d = v.dist; const b = d <= 10 ? true : d <= 25 ? c.t % 0.2 < 0.1 : d <= 50 ? c.t % 0.5 < 0.1 : false; return { buzzer: b, lcd: [pad('Park Distance:'), pad(`${d.toFixed(1)} cm`)], note: d <= 10 ? 'Continuous beep' : d <= 25 ? 'Fast beeps' : d <= 50 ? 'Slow beeps' : 'Silent' }; },
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // use 0x3F if the LCD stays blank

const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;

long duration;
float distance;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Parking Alert");
  delay(1500);
  lcd.clear();
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH, 30000);

  if (duration == 0) {
    noTone(buzzerPin);
    lcd.setCursor(0, 0);
    lcd.print("Park Distance:  ");
    lcd.setCursor(0, 1);
    lcd.print("Out of range    ");
  } else {
    distance = duration * 0.0343 / 2.0;
    lcd.setCursor(0, 0);
    lcd.print("Park Distance:  ");
    lcd.setCursor(0, 1);
    lcd.print(distance, 1);
    lcd.print(" cm      ");

    if (distance <= 10) {
      tone(buzzerPin, 2000);
    } else if (distance <= 25) {
      tone(buzzerPin, 1500);
      delay(100);
      noTone(buzzerPin);
      delay(100);
    } else if (distance <= 50) {
      tone(buzzerPin, 1000);
      delay(100);
      noTone(buzzerPin);
      delay(400);
    } else {
      noTone(buzzerPin);
      delay(200);
    }
  }
  delay(50);
}
` },
  { id: 'lamp', no: 7, title: 'Automatic Night Lamp', level: 'Intermediate', emoji: '🌙', image: 'c07', goal: 'Switch a relay (low-voltage demo lamp) ON only when it is dark AND motion is detected.',
    parts: [{ id: 'ldr', label: 'LDR Light Module', icon: '☀️', pins: ['VCC', 'GND', 'AO'] }, { id: 'pir', label: 'PIR Motion Sensor', icon: '🚶', pins: ['VCC', 'OUT', 'GND'] }, { id: 'rel', label: 'Relay Module (1 ch)', icon: '🔌', pins: ['VCC', 'GND', 'IN'] }],
    wires: [pwr('ldr.VCC'), gnd('ldr.GND'), w('UNO.A0', 'ldr.AO', 'Analog: brightness value 0–1023'), pwr('pir.VCC'), gnd('pir.GND'), w('UNO.D2', 'pir.OUT', 'Signal: HIGH when motion is detected'), pwr('rel.VCC'), gnd('rel.GND'), w('UNO.D8', 'rel.IN', 'Signal: LOW switches this active-LOW relay ON')],
    inputs: [{ id: 'light', label: 'Light level', type: 'range', min: 0, max: 1023, step: 10, def: 800 }, { id: 'motion', label: 'Motion detected', type: 'toggle', def: 0 }],
    run: v => { const on = v.light < 400 && !!v.motion; return { relay: on, note: `Light ${v.light} · ${v.motion ? 'Motion' : 'No motion'} → Lamp ${on ? 'ON' : 'OFF'}` }; },
    code: `// Use a LOW-VOLTAGE DC lamp on the relay for classroom demos - never mains on a breadboard.
const int ldrPin = A0;
const int pirPin = 2;
const int relayPin = 8;
const int darknessThreshold = 400;   // lower reading = darker (tune for your LDR)

void setup() {
  pinMode(ldrPin, INPUT);
  pinMode(pirPin, INPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH);      // active-LOW relay: HIGH = OFF
  Serial.begin(9600);
}

void loop() {
  int lightValue = analogRead(ldrPin);
  int motion = digitalRead(pirPin);

  bool isDark = (lightValue < darknessThreshold);
  bool motionDetected = (motion == HIGH);

  Serial.print("Light value: ");
  Serial.print(lightValue);
  Serial.print(" | Motion: ");
  Serial.print(motionDetected ? "Detected" : "Not detected");

  if (isDark && motionDetected) {
    digitalWrite(relayPin, LOW);     // relay ON
    Serial.println(" | Lamp ON");
  } else {
    digitalWrite(relayPin, HIGH);    // relay OFF
    Serial.println(" | Lamp OFF");
  }
  delay(300);
}
` },
  { id: 'dht', no: 10, title: 'Temperature & Humidity Monitor', level: 'Intermediate', emoji: '🌡️', image: 'c10', goal: 'Read a DHT11 sensor and show temperature and humidity on the LCD.',
    parts: [DHT, LCD], libs: ['LiquidCrystal_I2C', 'DHT sensor library (Adafruit)'],
    wires: [pwr('dht.VCC'), gnd('dht.GND'), w('UNO.D2', 'dht.DATA', 'Data: one-wire digital signal from DHT11'), ...lcdWires()],
    inputs: [{ id: 'temp', label: 'Temperature', type: 'range', min: 0, max: 50, step: 0.5, unit: '°C', def: 27 }, { id: 'hum', label: 'Humidity', type: 'range', min: 20, max: 90, step: 1, unit: '%', def: 60 }],
    run: v => ({ lcd: [pad(`Temp: ${v.temp.toFixed(1)}\u00b0C`), pad(`Humidity: ${v.hum.toFixed(0)}%`)] }),
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Temp & Humidity");
  delay(2000);
  lcd.clear();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sensor Error");
    Serial.println("Failed to read DHT11");
    delay(2000);
    return;
  }

  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(temperature, 1);
  lcd.print((char)223);
  lcd.print("C   ");

  lcd.setCursor(0, 1);
  lcd.print("Humidity: ");
  lcd.print(humidity, 0);
  lcd.print("%   ");

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" C | Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  delay(2000);
}
` },
  { id: 'tempwarn', no: 12, title: 'Temperature Warning Alarm', level: 'Intermediate', emoji: '🚨', image: 'c12', goal: 'Sound a buzzer and show “High Temp!” when temperature goes above 35 °C.',
    parts: [DHT, BUZ, LCD], libs: ['LiquidCrystal_I2C', 'DHT sensor library (Adafruit)'],
    wires: [pwr('dht.VCC'), gnd('dht.GND'), w('UNO.D2', 'dht.DATA', 'Data from DHT11'), w('UNO.D8', 'buz.+', 'Signal: D8 drives the buzzer'), gnd('buz.−'), ...lcdWires()],
    inputs: [{ id: 'temp', label: 'Temperature', type: 'range', min: 0, max: 50, step: 0.5, unit: '°C', def: 30 }, { id: 'hum', label: 'Humidity', type: 'range', min: 20, max: 90, step: 1, unit: '%', def: 55 }],
    run: v => { const hot = v.temp > 35; return { buzzer: hot, lcd: [pad(hot ? 'High Temp!' : `Temp: ${v.temp.toFixed(1)}\u00b0C`), pad(`Humidity: ${v.hum.toFixed(0)}%`)] }; },
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int buzzerPin = 8;
const float temperatureLimit = 35.0;

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(buzzerPin, OUTPUT);
  noTone(buzzerPin);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Temp Warning");
  delay(2000);
  lcd.clear();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    noTone(buzzerPin);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sensor Error");
    Serial.println("DHT11 reading failed");
    delay(2000);
    return;
  }

  lcd.setCursor(0, 0);
  if (temperature > temperatureLimit) {
    tone(buzzerPin, 2000);
    lcd.print("High Temp!      ");
    Serial.println("WARNING: High Temperature!");
  } else {
    noTone(buzzerPin);
    lcd.print("Temp: ");
    lcd.print(temperature, 1);
    lcd.print((char)223);
    lcd.print("C   ");
    Serial.print("Temperature: ");
    Serial.print(temperature, 1);
    Serial.println(" C");
  }

  lcd.setCursor(0, 1);
  lcd.print("Humidity: ");
  lcd.print(humidity, 0);
  lcd.print("%   ");
  delay(2000);
}
` },
  { id: 'soil', no: 13, title: 'Soil Moisture Plant Alert', level: 'Intermediate', emoji: '🌱', image: 'c13', goal: 'Show soil moisture % on the LCD and beep when the soil is dry.',
    parts: [{ id: 'soil', label: 'Soil Moisture Sensor', icon: '🌱', pins: ['VCC', 'GND', 'AO'] }, LCD, BUZ], libs: ['LiquidCrystal_I2C'],
    wires: [pwr('soil.VCC'), gnd('soil.GND'), w('UNO.A0', 'soil.AO', 'Analog: moisture reading 0–1023'), ...lcdWires(), w('UNO.D8', 'buz.+', 'Signal: D8 drives the buzzer'), gnd('buz.−')],
    inputs: [{ id: 'raw', label: 'Sensor reading (higher = drier)', type: 'range', min: 250, max: 900, step: 5, def: 600 }],
    run: v => { const m = Math.max(0, Math.min(100, trunc(((v.raw - 800) * 100) / (300 - 800)))); const dry = m < 30; return { buzzer: dry, lcd: [pad('Soil Moisture:'), pad(`${m}% ${dry ? '(Dry)' : '(Moist)'}`)], note: `Raw ${v.raw} → ${m}%` }; },
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int soilPin = A0;
const int buzzerPin = 8;

// Calibrate: note the reading in dry air and in water, then change these numbers
const int dryValue = 800;
const int wetValue = 300;
const int dryLimit = 30;

void setup() {
  Serial.begin(9600);
  pinMode(buzzerPin, OUTPUT);
  noTone(buzzerPin);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Soil Moisture");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(2000);
  lcd.clear();
}

void loop() {
  int sensorValue = analogRead(soilPin);
  int moisture = map(sensorValue, dryValue, wetValue, 0, 100);
  moisture = constrain(moisture, 0, 100);

  lcd.setCursor(0, 0);
  lcd.print("Soil Moisture:  ");
  lcd.setCursor(0, 1);
  lcd.print(moisture);
  lcd.print("% ");

  if (moisture < dryLimit) {
    lcd.print("(Dry)   ");
    tone(buzzerPin, 2000);
  } else {
    lcd.print("(Moist) ");
    noTone(buzzerPin);
  }

  Serial.print("Sensor Value: ");
  Serial.print(sensorValue);
  Serial.print(" | Soil Moisture: ");
  Serial.print(moisture);
  Serial.println("%");
  delay(1000);
}
` },
  { id: 'pot', no: 14, title: 'Potentiometer LED Dimmer', level: 'Intermediate', emoji: '🎚️', image: 'c14', goal: 'Turn a knob to change LED brightness (PWM) and see the value on the LCD.',
    parts: [{ id: 'pot', label: '10 kΩ Potentiometer', icon: '🎚️', pins: ['5V', 'WIPER', 'GND'] }, { id: 'led', label: 'Yellow LED + 220 Ω', icon: '🟡', pins: ['+', '−'], color: '#facc15' }, LCD], libs: ['LiquidCrystal_I2C'],
    wires: [w('UNO.5V', 'pot.5V', 'Power: one end of the pot track'), gnd('pot.GND'), w('UNO.A0', 'pot.WIPER', 'Analog: the wiper gives 0–1023'), w('UNO.D9', 'led.+', 'PWM pin D9 dims the LED'), gnd('led.−'), ...lcdWires()],
    inputs: [{ id: 'pot', label: 'Knob position', type: 'range', min: 0, max: 1023, step: 1, def: 512 }],
    run: v => ({ leds: { led: trunc((v.pot * 255) / 1023) / 255 }, lcd: [pad(`Analog: ${v.pot}`), pad(`Brightness: ${trunc((v.pot * 100) / 1023)}%`)] }),
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int potPin = A0;
const int ledPin = 9;      // D9 supports PWM

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Potentiometer");
  lcd.setCursor(0, 1);
  lcd.print("LED Brightness");
  delay(2000);
  lcd.clear();
}

void loop() {
  int analogValue = analogRead(potPin);
  int brightness = map(analogValue, 0, 1023, 0, 255);
  analogWrite(ledPin, brightness);
  int percentage = map(analogValue, 0, 1023, 0, 100);

  lcd.setCursor(0, 0);
  lcd.print("Analog: ");
  lcd.print(analogValue);
  lcd.print("    ");

  lcd.setCursor(0, 1);
  lcd.print("Brightness: ");
  lcd.print(percentage);
  lcd.print("%   ");

  Serial.print("Analog Value: ");
  Serial.print(analogValue);
  Serial.print(" | Brightness: ");
  Serial.print(percentage);
  Serial.println("%");
  delay(200);
}
` },
  { id: 'push', no: 15, title: 'Push Button Counter', level: 'Beginner', emoji: '🔘', image: 'c15', goal: 'Count button presses and show the count on the LCD.',
    parts: [{ id: 'btn', label: 'Push Button + 10 kΩ pull-down', icon: '🔘', pins: ['5V', 'OUT', 'GND'] }, LCD], libs: ['LiquidCrystal_I2C'],
    wires: [pwr('btn.5V'), gnd('btn.GND'), w('UNO.D2', 'btn.OUT', 'Signal: HIGH when the button is pressed'), ...lcdWires()],
    inputs: [{ id: 'press', label: 'Press the button', type: 'press', def: 0 }],
    run: v => ({ lcd: [pad(`Count: ${v.press}`), pad('Press the button')] }),
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int buttonPin = 2;       // button to 5V, 10k resistor to GND (pull-down)

int count = 0;
int buttonState = LOW;
int lastButtonState = LOW;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

void displayCount() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Count: ");
  lcd.print(count);
  lcd.setCursor(0, 1);
  lcd.print("Press the button");
}

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Push Button");
  lcd.setCursor(0, 1);
  lcd.print("Counter Ready");
  delay(2000);
  lcd.clear();
  displayCount();
}

void loop() {
  int reading = digitalRead(buttonPin);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == HIGH) {
        count++;
        Serial.print("Button pressed! Count: ");
        Serial.println(count);
        displayCount();
      }
    }
  }
  lastButtonState = reading;
}
` },
  { id: 'melody', no: 16, title: 'Buzzer Beep Patterns', level: 'Beginner', emoji: '🎵', image: 'c16', goal: 'Play five different beep patterns on a buzzer.',
    parts: [BUZ],
    wires: [w('UNO.D8', 'buz.+', 'Signal: D8 drives the buzzer'), gnd('buz.−')], inputs: [],
    run: (_v, c) => { const P = [[.2, .2, .2, .2, .2, 1.2], [.3, .7, .3, 1.0], [.8, .2, .2, .2, .8, 1.0], [.6, .6, .5, .5, .4, .4, .3, .3, .2, .2, .1, 1.1], [.1, .15, .1, .15, .1, .15, .1, .15, .1, 2.15]]; const tot = P.map(p => p.reduce((a, b) => a + b, 0)); const all = tot.reduce((a, b) => a + b, 0); let x = c.t % all; let k = 0; while (x >= tot[k]) { x -= tot[k]; k++; } return { buzzer: seq(x, P[k]), note: `Melody ${k + 1} of 5` }; },
    code: `const int buzzerPin = 8;

void beep(int onMs, int offMs) {
  digitalWrite(buzzerPin, HIGH);
  delay(onMs);
  digitalWrite(buzzerPin, LOW);
  delay(offMs);
}

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  // Melody 1: three short beeps
  for (int i = 0; i < 3; i++) {
    beep(200, 200);
  }
  delay(1000);

  // Melody 2: two beeps with a long pause
  beep(300, 700);
  beep(300, 0);
  delay(1000);

  // Melody 3: long, short, long
  beep(800, 200);
  beep(200, 200);
  beep(800, 0);
  delay(1000);

  // Melody 4: beeps getting faster
  for (int i = 600; i >= 100; i -= 100) {
    beep(i, i);
  }
  delay(1000);

  // Melody 5: five quick beeps
  for (int i = 0; i < 5; i++) {
    beep(100, 150);
  }
  delay(2000);
}
` },
  { id: 'traffic', no: 17, title: 'Traffic Light Controller', level: 'Beginner', emoji: '🚦', image: 'c17', goal: 'Run a Red → Green → Yellow traffic light sequence with three LEDs.',
    parts: [{ id: 'red', label: 'Red LED + 220 Ω', icon: '🔴', pins: ['+', '−'], color: '#ef4444' }, { id: 'yel', label: 'Yellow LED + 220 Ω', icon: '🟡', pins: ['+', '−'], color: '#facc15' }, { id: 'grn', label: 'Green LED + 220 Ω', icon: '🟢', pins: ['+', '−'], color: '#22c55e' }],
    wires: [w('UNO.D8', 'red.+', 'D8 → Red LED'), gnd('red.−'), w('UNO.D9', 'yel.+', 'D9 → Yellow LED'), gnd('yel.−'), w('UNO.D10', 'grn.+', 'D10 → Green LED'), gnd('grn.−')],
    inputs: [{ id: 'speed', label: 'Simulation speed', type: 'range', min: 1, max: 5, step: 1, unit: '×', def: 2 }],
    run: (v, c) => { const x = (c.t * v.speed) % 25; const ph = x < 10 ? 'red' : x < 20 ? 'grn' : 'yel'; return { leds: { red: ph === 'red' ? 1 : 0, grn: ph === 'grn' ? 1 : 0, yel: ph === 'yel' ? 1 : 0 }, note: ph === 'red' ? 'RED – 10 s' : ph === 'grn' ? 'GREEN – 10 s' : 'YELLOW – 5 s' }; },
    code: `const int redLED = 8;
const int yellowLED = 9;
const int greenLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
}

void loop() {
  // Red for 10 seconds
  digitalWrite(redLED, HIGH);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, LOW);
  delay(10000);

  // Green for 10 seconds
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, HIGH);
  delay(10000);

  // Yellow for 5 seconds
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, HIGH);
  digitalWrite(greenLED, LOW);
  delay(5000);
}
` },
];

// ---- wiring check helpers (pure functions, also used by the unit test) ----
export const key = (a: string, b: string) => [a, b].sort().join('~');
export interface CheckResult { ok: boolean; correct: string[]; wrong: string[]; missing: string[]; short: boolean }
export function checkWires(p: SimProject, student: [string, string][]): CheckResult {
  const exp = new Map(p.wires.map(x => [key(x[0], x[1]), x]));
  const have = new Set(student.map(s => key(s[0], s[1])));
  const correct = [...have].filter(k => exp.has(k));
  const wrong = [...have].filter(k => !exp.has(k));
  const missing = [...exp.keys()].filter(k => !have.has(k));
  const short = student.some(([a, b]) => (/\.(5V|VCC)$/.test(a) && /\.GND$/.test(b)) || (/\.(5V|VCC)$/.test(b) && /\.GND$/.test(a)));
  return { ok: wrong.length === 0 && missing.length === 0, correct, wrong, missing, short };
}
export const pinName = (id: string) => { const [pt, pin] = id.split('.'); return pt === 'UNO' ? `Arduino ${pin}` : `${pt.toUpperCase()} ${pin}`; };
