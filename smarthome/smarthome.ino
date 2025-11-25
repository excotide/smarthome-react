#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <BH1750.h>

// ------------ PIN SETUP -------------
#define MQ2_PIN       A0
#define FLAME_PIN     D5
#define RAIN_PIN      D7
#define BUZZER_PIN    D8
#define LED_RAIN      D3
#define LED_LAMPU     D4
#define FAN_PIN       D6       // Kipas
#define PUMP_PIN      D0       // Pompa pemadam api

// ------------ BH1750 -------------
BH1750 lightMeter;

const int MQ2_THRESHOLD = 500; // Ambang bahaya gas untuk MQ2;

// ------------ WIFI & MQTT -------------
const char* ssid = "testing";
const char* password = "12345678";

const char* mqtt_server = "48378e59b49d4cfeadc19503175e8732.s1.eu.hivemq.cloud"; // HiveMQ Cloud hostname
const int mqtt_port = 8883; // TLS port wajib untuk HiveMQ Cloud
const char* mqttUser = "excotide";
const char* mqttPassword = "Smarthome123";

// Gunakan TLS client untuk koneksi aman ke HiveMQ Cloud
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ------------ SETUP WIFI -------------
void setup_wifi() {
  delay(100);
  Serial.println("Menghubungkan ke WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
  Serial.println(WiFi.localIP());
}

// ------------ MQTT RECONNECT -------------
void reconnect() {
  while (!client.connected()) {
    Serial.print("Menghubungkan ke MQTT...");
    // Gunakan clientId unik agar tidak saling tendang jika ada perangkat lain
    String clientId = String("ESP8266_") + String(ESP.getChipId(), HEX);
    if (client.connect(clientId.c_str(), mqttUser, mqttPassword)) {
      Serial.println("Connected!");
    } else {
      Serial.print("Gagal, rc = ");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

// ------------ SETUP -------------
void setup() {
  Serial.begin(115200);

  pinMode(FLAME_PIN, INPUT_PULLUP);
  pinMode(RAIN_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_RAIN, OUTPUT);
  pinMode(LED_LAMPU, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(PUMP_PIN, LOW);

  setup_wifi();
  // Konfigurasi TLS (accept-all). Untuk produksi, sebaiknya gunakan root CA.
  espClient.setInsecure();
  // SNI akan di-set otomatis dengan hostname ketika PubSubClient melakukan koneksi

  client.setServer(mqtt_server, mqtt_port);
  client.setKeepAlive(30);
  client.setBufferSize(1024);

  // Inisialisasi I2C & BH1750
  Wire.begin();
  if (lightMeter.begin()) {
    Serial.println("BH1750 Siap");
  } else {
    Serial.println("Gagal menginisialisasi BH1750!");
  }

  // MQ2 preheat
  Serial.println("Memanaskan MQ2 (20 detik)...");
  delay(20000);
  Serial.println("MQ2 Siap!");
}

// ------------ LOOP -------------
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // ==============================
  // BACA SENSOR
  // ==============================

  int mq2 = analogRead(MQ2_PIN);        // MQ2 analog
  int flame = digitalRead(FLAME_PIN);   // Flame (LOW = api terdeteksi)
  int rain = digitalRead(RAIN_PIN);     // Rain
  float lux = lightMeter.readLightLevel();  // BH1750

  // ==============================
  // LOGIKA GAS + KIPAS
  // ==============================

  int gasStatus;  // 1 = aman, 0 = bahaya

  // Dibalik: nilai lebih kecil => gas/asap terdeteksi
  if (mq2 < MQ2_THRESHOLD) {
    gasStatus = 0;                 // bahaya/terdeteksi
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(FAN_PIN, HIGH);   // Kipas ON
  } else {
    gasStatus = 1;                 // aman
    digitalWrite(FAN_PIN, LOW);    // Kipas OFF
    digitalWrite(BUZZER_PIN, LOW);
  }

  // ==============================
  // LOGIKA API + POMPA
  // ==============================

  if (flame == LOW) { // Terdeteksi api
    digitalWrite(PUMP_PIN, HIGH);  // Pompa ON
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(PUMP_PIN, LOW);
  }

  // ==============================
  // LOGIKA HUJAN
  // ==============================

  digitalWrite(LED_RAIN, rain == LOW ? HIGH : LOW);

  // ==============================
  // LAMPU OTOMATIS BH1750
  // ==============================

  digitalWrite(LED_LAMPU, lux < 50 ? HIGH : LOW);

  // ==============================
  // KIRIM DATA KE MQTT
  // ==============================

  String payload = "{";
  payload += "\"mq2_raw\":" + String(mq2) + ",";
  payload += "\"gas_status\":" + String(gasStatus) + ",";
  payload += "\"flame\":" + String(flame) + ",";
  payload += "\"rain\":" + String(rain) + ",";
  payload += "\"lux\":" + String(lux);
  payload += "}";

  client.publish("esp/data", payload.c_str());

  Serial.println(payload);

  delay(800);
}