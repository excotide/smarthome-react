#include <Wire.h>
#include <BH1750.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// ===== WiFi Config =====
const char* ssid     = "Kos as 19-5G_2.4GEXT";
const char* password = "12345678";

// ===== MQTT Config =====
const char* mqttServer = "48378e59b49d4cfeadc19503175e8732.s1.eu.hivemq.cloud";
const int mqttPort = 8883;
const char* mqttUser = "excotide";
const char* mqttPassword = "Smarthome123";

WiFiClientSecure espClient;
PubSubClient client(espClient);

// ===== Pin Sensor =====
const int flamePin   = D5;
const int rainPin    = D7;
const int buzzerPin  = D8;
const int rainLedPin = D3;
const int lampLedPin = D4;

// === Sensor Gas & Aktuator ===
#define MQ2_ANALOG   A0
#define FAN_PIN      D6
#define PUMP_PIN     D0
const int MQ2_THRESHOLD = 500;

// ===== BH1750 =====
BH1750 lightMeter;
const int lightThreshold = 50;

// ===== Mode Lampu =====
// Legacy manual flag dihapus; gunakan hanya autoLampEnabled + perintah langsung
bool autoLampEnabled = true;         // diterima dari server: AUTO_ON / AUTO_OFF
bool lampStatus = false;             // status aktual lampu (true = HIGH)
bool lastPublishedLampStatus = false;
unsigned long lastSensorPublish = 0; // interval kirim sensor
const unsigned long sensorPublishInterval = 500; // ms

// ===== Buzzer timing =====
unsigned long lastBuzz = 0;

// ===== Fungsi buzzer =====
void buzzMultiple(int count, int duration, int pause) {
  for (int i = 0; i < count; i++) {
    tone(buzzerPin, 1000);
    delay(duration);
    noTone(buzzerPin);
    delay(pause);
  }
}

// ===== MQTT Callback =====
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];

  // Perintah manual lampu: diproses hanya jika autoLampEnabled = false
  if (String(topic) == "arduino/lamp") {
    if (autoLampEnabled) return; // abaikan jika mode otomatis aktif
    if (message == "LAMP_ON") {
      lampStatus = true;
      digitalWrite(lampLedPin, HIGH);
      if (lampStatus != lastPublishedLampStatus) {
        client.publish("arduino/lamp/state", "LAMP_ON", true);
        lastPublishedLampStatus = lampStatus;
      }
    } else if (message == "LAMP_OFF") {
      lampStatus = false;
      digitalWrite(lampLedPin, LOW);
      if (lampStatus != lastPublishedLampStatus) {
        client.publish("arduino/lamp/state", "LAMP_OFF", true);
        lastPublishedLampStatus = lampStatus;
      }
    }
  }

  if (String(topic) == "arduino/lamp/auto") {
    if (message == "AUTO_ON") {
      autoLampEnabled = true;
    } else if (message == "AUTO_OFF") {
      autoLampEnabled = false;
    }
  }
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void connectMQTT() {
  while (!client.connected()) {
    if (client.connect("ArduinoClient", mqttUser, mqttPassword)) {
      client.subscribe("arduino/lamp");
      client.subscribe("arduino/lamp/auto");
    } else delay(2000);
  }
}

void setup() {
  Serial.begin(115200);
  connectWiFi();

  espClient.setInsecure();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  pinMode(flamePin, INPUT);
  pinMode(rainPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(rainLedPin, OUTPUT);
  pinMode(lampLedPin, OUTPUT);

  pinMode(MQ2_ANALOG, INPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);

  digitalWrite(FAN_PIN, LOW);
  digitalWrite(PUMP_PIN, LOW);
  noTone(buzzerPin);

  Wire.begin(D2, D1);
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23);
}

void loop() {
  if (!client.connected()) connectMQTT();
  client.loop();

  // ==== SENSOR ====
  int flameState = digitalRead(flamePin);
  int rainState  = digitalRead(rainPin);
  float lux      = lightMeter.readLightLevel();
  int mq2Analog  = analogRead(MQ2_ANALOG);

  unsigned long now = millis();

  // ==== KIPAS OTOMATIS ====
  digitalWrite(FAN_PIN, mq2Analog > MQ2_THRESHOLD ? HIGH : LOW);

  // ==== POMPA API ====
  digitalWrite(PUMP_PIN, flameState == LOW ? HIGH : LOW);

  // ==== LAMPU OTOMATIS (prioritas autoLampEnabled) ====
  if (autoLampEnabled) {
    bool shouldOn = lux < lightThreshold;
    if (shouldOn != lampStatus) {
      lampStatus = shouldOn;
      digitalWrite(lampLedPin, lampStatus ? HIGH : LOW);
      if (lampStatus != lastPublishedLampStatus) {
        client.publish("arduino/lamp/state", lampStatus ? "LAMP_ON" : "LAMP_OFF", true);
        lastPublishedLampStatus = lampStatus;
      }
    }
  }

  // ==== LED HUJAN ====
  digitalWrite(rainLedPin, rainState == LOW ? HIGH : LOW);

  // ==== BUZZER LOGIC ====
  if (now - lastBuzz > 2000) {

    // Api terdeteksi
    if (flameState == LOW) {
      buzzMultiple(3, 120, 120);
      lastBuzz = now;
    }

    // Gas terdeteksi
    else if (mq2Analog > MQ2_THRESHOLD) {
      buzzMultiple(3, 120, 120);
      lastBuzz = now;
    }

    // Hujan terdeteksi
    else if (rainState == LOW) {
      buzzMultiple(1, 150, 50);
      lastBuzz = now;
    }
  }

  // === MQTT Payload (tambahkan gas_status) ===
  int gas_status = mq2Analog > MQ2_THRESHOLD ? 0 : 1; // 0 bahaya, 1 aman
  unsigned long nowPub = millis();
  if (nowPub - lastSensorPublish >= sensorPublishInterval) {
    lastSensorPublish = nowPub;
    String payload = "{";
    payload += "\"mq2_analog\":" + String(mq2Analog) + ",";
    payload += "\"gas_status\":" + String(gas_status) + ",";
    payload += "\"flame\":" + String(flameState) + ",";
    payload += "\"rain\":" + String(rainState) + ",";
    payload += "\"lux\":" + String(lux);
    payload += "}";
    client.publish("arduino/sensors", payload.c_str());
  }
  delay(500);
}