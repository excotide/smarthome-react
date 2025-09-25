import express from "express";
import Sensor from "../models/Sensor.js";
import History from "../models/History.js";

const router = express.Router();

// Fungsi untuk mengonversi data sensor mentah ke format yang konsisten
const normalizeSensorData = (rawData) => {
  const normalized = {
    temperature: rawData.temperature || 0,
    humidity: rawData.humidity || 0,
    lightLevel: rawData.lux ? Math.round((rawData.lux / 1000) * 100) : (rawData.lightLevel || 0),
    gasDetected: rawData.mq2 === 0 || rawData.gasDetected || false,
    rainDetected: rawData.rain === 0 || rawData.rainDetected || false,
    fireDetected: rawData.flame === 0 || rawData.fireDetected || false,
    motionDetected: rawData.motionDetected || false,
    lampStatus: rawData.lampStatus || false
  };
  
  // Debug log untuk melihat conversion
  if (rawData.flame !== undefined || rawData.fireDetected !== undefined) {
    console.log('Fire detection:', { 
      raw: { flame: rawData.flame, fireDetected: rawData.fireDetected }, 
      normalized: { fireDetected: normalized.fireDetected } 
    });
  }
  
  return normalized;
};

// Algoritma deteksi perubahan untuk auto-generate history
const detectChangesAndCreateHistory = async (prev, current, io) => {
  const threshold = {
    temperature: 2,
    humidity: 5,
    lightLevel: 10
  };

  const changes = [];
  const currentNormalized = normalizeSensorData(current);
  const prevNormalized = prev ? normalizeSensorData(prev) : null;

  if (!prevNormalized) {
    // Entry pertama
    changes.push({
      type: 'info',
      message: 'Sistem monitoring sensor dimulai',
      icon: 'info',
      sensorData: currentNormalized
    });
  } else {
    // Deteksi perubahan temperatur
    if (Math.abs(currentNormalized.temperature - prevNormalized.temperature) >= threshold.temperature) {
      changes.push({
        type: currentNormalized.temperature > prevNormalized.temperature ? 'warning' : 'info',
        message: `Suhu ${currentNormalized.temperature > prevNormalized.temperature ? 'naik' : 'turun'} dari ${prevNormalized.temperature}°C ke ${currentNormalized.temperature}°C`,
        icon: 'temperature',
        sensorData: currentNormalized
      });
    }

    // Deteksi perubahan kelembapan
    if (Math.abs(currentNormalized.humidity - prevNormalized.humidity) >= threshold.humidity) {
      changes.push({
        type: 'info',
        message: `Kelembapan berubah dari ${prevNormalized.humidity}% ke ${currentNormalized.humidity}%`,
        icon: 'humidity',
        sensorData: currentNormalized
      });
    }

    // Deteksi perubahan cahaya
    if (Math.abs(currentNormalized.lightLevel - prevNormalized.lightLevel) >= threshold.lightLevel) {
      changes.push({
        type: 'info',
        message: `Tingkat cahaya berubah ke ${currentNormalized.lightLevel}%`,
        icon: 'light',
        sensorData: currentNormalized
      });
    }

    // Deteksi api/asap
    if (currentNormalized.fireDetected !== prevNormalized.fireDetected) {
      console.log('🔥 FIRE DETECTION CHANGE:', {
        previous: prevNormalized.fireDetected,
        current: currentNormalized.fireDetected,
        rawPrev: prevSensor?.flame,
        rawCurrent: currentSensor?.flame
      });
      
      changes.push({
        type: currentNormalized.fireDetected ? 'danger' : 'success',
        message: currentNormalized.fireDetected ? 'BAHAYA! Api terdeteksi!' : 'Api tidak terdeteksi lagi',
        icon: 'fire',
        sensorData: currentNormalized
      });
    }

    // Deteksi gas
    if (currentNormalized.gasDetected !== prevNormalized.gasDetected) {
      changes.push({
        type: currentNormalized.gasDetected ? 'danger' : 'success',
        message: currentNormalized.gasDetected ? 'BAHAYA! Gas terdeteksi!' : 'Gas tidak terdeteksi lagi',
        icon: 'gas',
        sensorData: currentNormalized
      });
    }

    // Deteksi hujan
    if (currentNormalized.rainDetected !== prevNormalized.rainDetected) {
      changes.push({
        type: currentNormalized.rainDetected ? 'warning' : 'info',
        message: currentNormalized.rainDetected ? 'Hujan terdeteksi' : 'Hujan berhenti',
        icon: 'rain',
        sensorData: currentNormalized
      });
    }

    // Deteksi perubahan status lampu
    if (currentNormalized.lampStatus !== prevNormalized.lampStatus) {
      changes.push({
        type: 'info',
        message: `Lampu ${currentNormalized.lampStatus ? 'menyala' : 'padam'}${currentNormalized.lampStatus && currentNormalized.lightLevel < 30 ? ' (Auto Mode - Cahaya rendah)' : ''}`,
        icon: 'lamp',
        sensorData: currentNormalized
      });
    }

    // Deteksi gerakan
    if (currentNormalized.motionDetected !== prevNormalized.motionDetected) {
      changes.push({
        type: currentNormalized.motionDetected ? 'warning' : 'info',
        message: currentNormalized.motionDetected ? 'Gerakan terdeteksi' : 'Tidak ada gerakan',
        icon: 'motion',
        sensorData: currentNormalized
      });
    }
  }

  // Simpan semua perubahan ke database dan broadcast
  for (const change of changes) {
    try {
      const historyEntry = new History(change);
      const savedHistory = await historyEntry.save();
      
      console.log('✅ History saved:', {
        type: change.type,
        message: change.message,
        icon: change.icon,
        id: savedHistory._id
      });
      
      // Broadcast ke semua client
      io.emit('history_update', savedHistory);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  return changes;
};

// POST data sensor baru
router.post("/", async (req, res) => {
  try {
    // Ambil data sensor terakhir untuk perbandingan
    const lastSensor = await Sensor.findOne().sort({ createdAt: -1 });
    
    // Simpan data sensor baru
    const data = new Sensor(req.body);
    const saved = await data.save();

    // Deteksi perubahan dan buat history otomatis
    await detectChangesAndCreateHistory(lastSensor, saved, req.io);

    // broadcast sensor update ke client via socket.io
    req.io.emit("sensor_update", saved);

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET riwayat sensor
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const sensors = await Sensor.find().sort({ createdAt: -1 }).limit(limit);
  res.json(sensors);
});

// Test endpoint untuk simulasi deteksi api
router.post("/test-fire", async (req, res) => {
  try {
    console.log('🔥 TEST FIRE DETECTION TRIGGERED');
    
    // Ambil sensor terakhir
    const lastSensor = await Sensor.findOne().sort({ createdAt: -1 });
    
    // Buat data sensor dengan api terdeteksi (flame: 0)
    const testSensorData = {
      temperature: lastSensor?.temperature || 25,
      humidity: lastSensor?.humidity || 60,
      lux: lastSensor?.lux || 500,
      mq2: lastSensor?.mq2 || 1, // No gas
      rain: lastSensor?.rain || 1, // No rain
      flame: 0, // FIRE DETECTED!
      motionDetected: lastSensor?.motionDetected || false,
      lampStatus: lastSensor?.lampStatus || false
    };
    
    console.log('Test sensor data:', testSensorData);
    
    // Simpan data sensor baru
    const data = new Sensor(testSensorData);
    const saved = await data.save();

    // Deteksi perubahan dan buat history otomatis
    await detectChangesAndCreateHistory(lastSensor, saved, req.io);

    // broadcast sensor update ke client via socket.io
    req.io.emit("sensor_update", saved);

    res.json({ 
      message: 'Fire detection test triggered',
      sensorData: saved 
    });
  } catch (err) {
    console.error('Test fire error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
