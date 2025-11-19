import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mqtt from "mqtt"; // Tambahkan library MQTT
import sensorRoutes from "./routes/sensorRoutes.js";
import lampRoutes from "./routes/lampRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gasRoutes from "./routes/gasRoutes.js"; // baru
import historyRoutes from "./routes/historyRoutes.js"; // baru
import pushRoutes from "./routes/pushRoutes.js"; // push
import webpush from 'web-push';
import Sensor from "./models/Sensor.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// middleware
app.use(cors());
app.use(express.json());

// inject io ke request biar bisa dipakai di route
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  req.io = io;
  next();
});

// routes
app.use("/api/sensor", sensorRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/lamp", lampRoutes);
app.use("/api/controlManual", lampRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gas", gasRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/push", pushRoutes);

// ===== Web Push Configuration =====
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configured');
} else {
  console.warn('⚠️ VAPID keys not set. Push notifications disabled until configured.');
}

// koneksi database
mongoose
  .connect("mongodb://127.0.0.1:27017/smart_home")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ===== MQTT Configuration =====
const mqttClient = mqtt.connect("mqtts://48378e59b49d4cfeadc19503175e8732.s1.eu.hivemq.cloud", {
  port: 8883,
  username: "excotide", // Ganti dengan username HiveMQ Anda
  password: "Smarthome123", // Ganti dengan password HiveMQ Anda
});

// Ketika terhubung ke broker MQTT
mqttClient.on("connect", () => {
  console.log("✅ Terhubung ke broker MQTT");
  mqttClient.subscribe("arduino/sensors", (err) => {
    if (err) {
      console.error("❌ Gagal berlangganan ke topik arduino/sensors:", err);
    } else {
      console.log("✅ Berlangganan ke topik arduino/sensors");
    }
  });
  // Subscribe ke topik status kontrol manual dan lampu dari Arduino
  mqttClient.subscribe("arduino/controlManual/state", (err) => {
    if (err) {
      console.error("❌ Gagal subscribe arduino/controlManual/state:", err);
    } else {
      console.log("✅ Berlangganan ke topik arduino/controlManual/state");
    }
  });
  mqttClient.subscribe("arduino/lamp/state", (err) => {
    if (err) {
      console.error("❌ Gagal subscribe arduino/lamp/state:", err);
    } else {
      console.log("✅ Berlangganan ke topik arduino/lamp/state");
    }
  });
});

// Ketika pesan diterima dari broker MQTT
mqttClient.on("message", async (topic, message) => {
  if (topic === "arduino/sensors") {
    const payload = message.toString();
    console.log("📩 Data diterima dari topik arduino/sensors:", payload);
    try {
      const data = JSON.parse(payload);
      // Format yang didukung:
      // 1. Baru: {"mq2_raw":154,"gas_status":1,"flame":1,"rain":1,"lux":4.17}
      // 2. Lama: {"mq2":154,"flame":1,"rain":1,"lux":4.17}
      // 3. Variasi perangkat lain: {"mq2_analog":230,...}
      const flame = Number(data.flame);
      let mq2;
      if (data.mq2_raw !== undefined) mq2 = Number(data.mq2_raw);
      else if (data.mq2 !== undefined) mq2 = Number(data.mq2);
      else if (data.mq2_analog !== undefined) mq2 = Number(data.mq2_analog);
      // Validasi mq2
      if (mq2 === undefined || Number.isNaN(mq2)) {
        console.warn("⚠️ Payload tidak mengandung nilai MQ2 valid, abaikan penyimpanan.");
        // Tetap emit live agar UI bisa lihat flame/rain/lux meski mq2 invalid
        const rainTmp = Number(data.rain);
        const luxTmp = typeof data.lux === 'number' ? data.lux : Number(data.lux);
        io.emit("sensor_live", {
          flame,
          mq2: null,
          gas_status: null,
          rain: rainTmp,
          lux: luxTmp,
          createdAt: new Date().toISOString(),
        });
        return;
      }
      const rain = Number(data.rain);
      const lux = typeof data.lux === 'number' ? data.lux : Number(data.lux);
      const gas_status = data.gas_status !== undefined
        ? Number(data.gas_status)
        : (mq2 > 500 ? 0 : 1); // fallback kalkulasi sederhana jika tidak dikirim

      // Emit realtime (ringan) untuk semua update agar UI bisa refresh tingkat cahaya tanpa spam DB
      io.emit("sensor_live", {
        flame,
        mq2,
        gas_status,
        rain,
        lux,
        createdAt: new Date().toISOString(),
      });

      // Dedup: hanya simpan jika ada perubahan pada sensor biner (flame/mq2/rain/gas_status)
      const last = await Sensor.findOne().sort({ createdAt: -1 });
      const sameBinary = last &&
        Number(last.flame) === flame &&
        Number(last.mq2) === mq2 &&
        Number(last.rain) === rain &&
        ((last.gas_status !== undefined && gas_status !== undefined) ? Number(last.gas_status) === gas_status : true);
      if (sameBinary) {
        return; // tidak ada perubahan penting
      }

      const doc = new Sensor({ flame, mq2, gas_status, rain, lux });
      const saved = await doc.save();
      console.log("✅ Data sensor disimpan ke database (perubahan biner)");
      io.emit("sensor_update", saved);

      // ===== Push trigger: hanya kirim saat api pertama kali terdeteksi (tidak spam) =====
      try {
        // Notifikasi hanya jika flame berubah dari 1 ke 0 (deteksi api: flame=0)
        const lastFlame = last ? Number(last.flame) : 1;
        const flameJustDetected = lastFlame === 1 && flame === 0;
        if (flameJustDetected) {
          const { default: PushSubscription } = await import('./models/PushSubscription.js');
          const subs = await PushSubscription.find();
          const title = '🔥 Api terdeteksi!';
          const body = 'Pompa air dinyalakan untuk mencegah penyebaran api. Segera periksa!';
          const payloadPush = JSON.stringify({ title, body });
          for (const s of subs) {
            try {
              await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payloadPush);
            } catch (errPush) {
              console.warn('Push send failed (akan di-skip):', errPush.message);
            }
          }
        }
        // Notifikasi gas: hanya saat status berubah ke bahaya
        const lastGas = last ? Number(last.gas_status) : 1;
        const gasJustDanger = lastGas !== 0 && gas_status === 0;
        if (gasJustDanger) {
          const { default: PushSubscription } = await import('./models/PushSubscription.js');
          const subs = await PushSubscription.find();
          const title = '💨 Gas berbahaya terdeteksi!';
          const body = 'Sistem mendeteksi gas melebihi ambang. Kipas dinyalakan';
          const payloadPush = JSON.stringify({ title, body });
          for (const s of subs) {
            try {
              await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payloadPush);
            } catch (errPush) {
              console.warn('Push send failed (akan di-skip):', errPush.message);
            }
          }
        }

        // Notifikasi hujan: hanya saat rain berubah dari 1 ke 0 (rain=0 = hujan terdeteksi)
        const lastRain = last ? Number(last.rain) : 1;
        const rainJustDetected = lastRain === 1 && rain === 0;
        if (rainJustDetected) {
          const { default: PushSubscription } = await import('./models/PushSubscription.js');
          const subs = await PushSubscription.find();
          const title = 'Hujan terdeteksi!';
          const body = 'Sensor mendeteksi adanya hujan di area sekitar.';
          const payloadPush = JSON.stringify({ title, body });
          for (const s of subs) {
            try {
              await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payloadPush);
            } catch (errPush) {
              console.warn('Push send failed (akan di-skip):', errPush.message);
            }
          }
        }
      } catch (errTrig) {
        console.warn('Push trigger error (stub):', errTrig.message);
      }
    } catch (e) {
      console.error("❌ Gagal parse/simpan payload sensor:", e);
    }
  } else if (topic === "arduino/controlManual/state") {
    const val = message.toString();
    const enabled = val.toUpperCase() === "ON" || val === "1" || val.toLowerCase() === "true";
    console.log("📩 Status control manual:", val);
    io.emit("control_manual_update", {
      controlManual: enabled,
      timestamp: new Date().toISOString(),
    });
  } else if (topic === "arduino/lamp/state") {
    const val = message.toString();
    const up = val.toUpperCase();
    const on = up === "ON" || up === "LAMP_ON" || val === "1" || val.toLowerCase() === "true";
    console.log("📩 Status lamp:", val);
    io.emit("lamp_update", {
      lampStatus: on,
      timestamp: new Date().toISOString(),
    });
  }
});

// socket.io connect
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// start server
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log("Server running on http://localhost:" + PORT);
});