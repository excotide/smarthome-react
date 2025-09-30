import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mqtt from "mqtt"; // Tambahkan library MQTT
import sensorRoutes from "./routes/sensorRoutes.js";
import lampRoutes from "./routes/lampRoutes.js";

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
mqttClient.on("message", (topic, message) => {
  if (topic === "arduino/sensors") {
    console.log("📩 Data diterima dari topik arduino/sensors:", message.toString());

    // Emit data ke semua client melalui Socket.IO
    io.emit("sensor_update", JSON.parse(message.toString()));

    // Simpan data ke database jika diperlukan
    // Contoh: Simpan ke MongoDB
    /*
    const sensorData = JSON.parse(message.toString());
    const newSensorData = new SensorModel(sensorData);
    newSensorData.save()
      .then(() => console.log("Data sensor disimpan ke database"))
      .catch((err) => console.error("Gagal menyimpan data sensor:", err));
    */
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
    const on = val.toUpperCase() === "ON" || val === "1" || val.toLowerCase() === "true";
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
server.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});