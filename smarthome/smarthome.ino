#include <Wire.h>
#include <BH1750.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// ===== WiFi Config =====
const char* ssid     = "testing";
const char* password = "12345678";

// ===== Server API =====
String serverUrl = "http://192.168.179.65:3000/api/sensors"; // ganti dengan IP servermu

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

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  // Tunggu WiFi
  Serial.print("🔗 Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Terkoneksi!");
  Serial.println(WiFi.localIP());

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
  if (lightMeter.begin()) {
    Serial.println("🌞 BH1750 siap digunakan...");
  } else {
    Serial.println("⚠ BH1750 tidak terdeteksi!");
  }

  Serial.println("🔥 Flame + MQ-2 + Rain Drop + LED + BH1750 siap...");
}

void loop() {
  // Baca sensor
  int flameState = digitalRead(flamePin);
  int mq2State   = digitalRead(mq2Pin);
  int rainState  = digitalRead(rainPin);
  float lux      = lightMeter.readLightLevel();

  // 🌙 Lampu otomatis
  if (lux < lightThreshold) {
    digitalWrite(lampLedPin, HIGH);
  } else {
    digitalWrite(lampLedPin, LOW);
  }

  // 🚨 Alarm fisik (prioritas api/gas)
  if (flameState == LOW || mq2State == LOW) {
    for (int i = 0; i < 3; i++) {
      tone(buzzerPin, 1000);
      delay(300);
      noTone(buzzerPin);
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

  // === Kirim ke Server ===
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"flame\":" + String(flameState) + ",";
    jsonPayload += "\"mq2\":"   + String(mq2State) + ",";
    jsonPayload += "\"rain\":"  + String(rainState) + ",";
    jsonPayload += "\"lux\":"   + String(lux, 2);
    jsonPayload += "}";

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("✅ Data terkirim! Response: %d\n", httpResponseCode);
    } else {
      Serial.printf("❌ Gagal kirim data: %d\n", httpResponseCode);
    }

    http.end();
  }

  delay(300); // kirim setiap detik
}
