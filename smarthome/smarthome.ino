#include <Wire.h>
#include <BH1750.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// ===== WiFi Config =====
const char* ssid     = "testing";       // Ganti dengan SSID Wi-Fi Anda
const char* password = "12345678";     // Ganti dengan password Wi-Fi Anda

// ===== MQTT Config =====
const char* mqttServer = "48378e59b49d4cfeadc19503175e8732.s1.eu.hivemq.cloud"; // HiveMQ broker
const int mqttPort = 8883; // Port TLS/SSL
const char* mqttUser = "excotide"; // Ganti dengan username HiveMQ Anda
const char* mqttPassword = "Smarthome123"; // Ganti dengan password HiveMQ Anda

WiFiClientSecure espClient; // Gunakan WiFiClientSecure untuk TLS/SSL
PubSubClient client(espClient);   

// ===== Pin Sensor =====
const int flamePin   = D5;   // Flame sensor DO
const int mq2Pin     = D6;   // MQ-2 sensor DO
const int rainPin    = D7;   // Rain Drop sensor DO
const int buzzerPin  = D8;   // Buzzer
const int rainLedPin = D3;   // LED indikator hujan
const int lampLedPin = D4;   // LED lampu otomatis

// ===== BH1750 =====
BH1750 lightMeter;
const int lightThreshold = 50; // Lux threshold (gelap < 50 lux)

// Status kontrol manual (false = otomatis, true = manual)
bool controlManual = false; 
// Waktu mengaktifkan mode manual (untuk menghindari race perintah lamp)
unsigned long manualActivatedAt = 0; 

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Pesan diterima di topik: ");
  Serial.println(topic);
  Serial.print("Isi pesan: ");
  Serial.println(message);

  // Logika untuk kontrol manual
  if (String(topic) == "arduino/controlManual") {
    if (message == "MANUAL_ON") {
      controlManual = true; // Aktifkan kontrol manual
      Serial.println("Kontrol manual diaktifkan!");
      // Default aman: matikan lampu saat masuk mode manual
      digitalWrite(lampLedPin, LOW);
      client.publish("arduino/lamp/state", "OFF", true);
      client.publish("arduino/controlManual/state", "ON", true);
      manualActivatedAt = millis();
    } else if (message == "MANUAL_OFF") {
      controlManual = false; // Nonaktifkan kontrol manual
      Serial.println("Kontrol manual dinonaktifkan!");
      client.publish("arduino/controlManual/state", "OFF", true);
    }
  }

  // Logika untuk menyalakan/mematikan lampu
  if (String(topic) == "arduino/lamp" && controlManual) { // Hanya jika kontrol manual aktif
    // Hindari perintah lampu yang datang terlambat tepat setelah beralih ke manual
    if (millis() - manualActivatedAt < 500) {
      Serial.println("Abaikan perintah lampu (grace period setelah MANUAL_ON)");
      return;
    }
    if (message == "LAMP_ON") {
      digitalWrite(lampLedPin, HIGH); // Nyalakan lampu
      Serial.println("Lampu dinyalakan secara manual!");
      client.publish("arduino/lamp/state", "ON", true);
    } else if (message == "LAMP_OFF") {
      digitalWrite(lampLedPin, LOW); // Matikan lampu
      Serial.println("Lampu dimatikan secara manual!");
      client.publish("arduino/lamp/state", "OFF", true);
    }
  }
}

// Fungsi untuk menghubungkan ke Wi-Fi
void connectWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("🔗 Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Terkoneksi!");
  Serial.println(WiFi.localIP());
}

// Fungsi untuk menghubungkan ke broker MQTT
void connectMQTT() {
  while (!client.connected()) {
    Serial.println("🔗 Menghubungkan ke broker MQTT...");
    if (client.connect("ArduinoClient", mqttUser, mqttPassword)) {
      Serial.println("✅ Terhubung ke broker MQTT!");
      client.subscribe("arduino/lamp"); // Berlangganan ke topik untuk kontrol lampu
      client.subscribe("arduino/controlManual"); // Berlangganan ke topik untuk kontrol manual
      // Publikasikan state awal (retained) agar backend/klien langsung sinkron
      client.publish("arduino/controlManual/state", controlManual ? "ON" : "OFF", true);
      client.publish("arduino/lamp/state", digitalRead(lampLedPin) == HIGH ? "ON" : "OFF", true);
    } else {
      Serial.print("❌ Gagal terhubung. State: ");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  connectWiFi();

  // Konfigurasi MQTT
  espClient.setInsecure(); // Nonaktifkan verifikasi sertifikat (untuk HiveMQ Free Plan)
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback); // Set callback untuk menerima pesan

  // Inisialisasi pin
  pinMode(flamePin, INPUT);
  pinMode(mq2Pin, INPUT);
  pinMode(rainPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(rainLedPin, OUTPUT);
  pinMode(lampLedPin, OUTPUT);

  noTone(buzzerPin);
  digitalWrite(rainLedPin, LOW);
  digitalWrite(lampLedPin, LOW);

  // Inisialisasi sensor cahaya
  Wire.begin(D2, D1);  // SDA = D2, SCL = D1
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23)) {
    Serial.println("🌞 BH1750 siap digunakan...");
  } else {
    Serial.println("⚠ BH1750 tidak terdeteksi!");
  }

  Serial.println("🔥 Flame + MQ-2 + Rain Drop + LED + BH1750 siap...");
}

void loop() {
  // Pastikan terhubung ke MQTT
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop(); // Proses pesan MQTT

  // Baca sensor
  int flameState = digitalRead(flamePin);
  int mq2State   = digitalRead(mq2Pin);
  int rainState  = digitalRead(rainPin);
  float lux      = lightMeter.readLightLevel();

  // Deteksi perubahan mode kontrol manual -> auto, dan sinkronkan lampu sesuai lux
  static bool prevControlManual = controlManual;
  static bool lastLampAuto = false; // jejak status auto terakhir yang dipublish
  if (prevControlManual != controlManual) {
    if (!controlManual) {
      // Baru beralih ke mode otomatis: paksa setel lampu sesuai lux saat ini
      bool shouldOnNow = lux < lightThreshold;
      digitalWrite(lampLedPin, shouldOnNow ? HIGH : LOW);
      client.publish("arduino/lamp/state", shouldOnNow ? "ON" : "OFF", true);
      lastLampAuto = shouldOnNow;
      Serial.println("Mode otomatis aktif kembali, sinkronkan lampu sesuai lux.");
    }
    prevControlManual = controlManual;
  }

  // 🌙 Lampu otomatis
  if (!controlManual) { // Hanya aktif jika kontrol manual tidak aktif
    bool shouldOn = lux < lightThreshold;
    if (shouldOn != lastLampAuto) {
      digitalWrite(lampLedPin, shouldOn ? HIGH : LOW);
      Serial.println(shouldOn ? "Lampu dinyalakan secara otomatis!" : "Lampu dimatikan secara otomatis!");
      client.publish("arduino/lamp/state", shouldOn ? "ON" : "OFF", true);
      lastLampAuto = shouldOn;
    }
  }

  // 🚨 Alarm fisik (prioritas api/gas)
  if (flameState == LOW || mq2State == LOW) {
    for (int i = 0; i < 3; i++) {
      tone(buzzerPin, 1000);
      digitalWrite(rainLedPin, HIGH);
      delay(300);
      noTone(buzzerPin);
      digitalWrite(rainLedPin, LOW);
      delay(200);
    }
  } else if (rainState == LOW) {
    digitalWrite(rainLedPin, HIGH);
    tone(buzzerPin, 1000);
    delay(200);
    noTone(buzzerPin);
    digitalWrite(rainLedPin, LOW);
    delay(200);
  } else {
    noTone(buzzerPin);
    digitalWrite(rainLedPin, LOW);
  }

  // === Kirim data ke broker MQTT ===
  String jsonPayload = "{";
  jsonPayload += "\"flame\":" + String(flameState) + ",";
  jsonPayload += "\"mq2\":"   + String(mq2State) + ",";
  jsonPayload += "\"rain\":"  + String(rainState) + ",";
  jsonPayload += "\"lux\":"   + String(lux, 2);
  jsonPayload += "}";

  // Publish data ke topik MQTT
  if (client.publish("arduino/sensors", jsonPayload.c_str())) {
    Serial.println("✅ Data terkirim ke broker MQTT!");
  } else {
    Serial.println("❌ Gagal mengirim data ke broker MQTT!");
  }

  delay(1000); // Kirim setiap 1 detik
}