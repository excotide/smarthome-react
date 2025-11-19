import express from 'express';
import mqtt from 'mqtt';

const router = express.Router();

// Konfigurasi broker HiveMQ
const mqttClient = mqtt.connect('mqtts://48378e59b49d4cfeadc19503175e8732.s1.eu.hivemq.cloud', {
  port: 8883, // Port untuk koneksi TLS/SSL
  username: 'excotide', // Ganti dengan username HiveMQ Anda
  password: 'Smarthome123', // Ganti dengan password HiveMQ Anda
});

mqttClient.on('connect', () => {
  console.log('Connected to HiveMQ broker');
});

// Variable untuk menyimpan status lampu
let lampStatus = false;
let autoLampEnabled = true; // status lampu otomatis (parent)

// GET gabungan status lampu dan otomatis
router.get('/state', (req, res) => {
  res.json({ lampStatus, autoLampEnabled });
});

// GET status lampu otomatis
router.get('/auto', (req, res) => {
  res.json({ autoLampEnabled });
});

// SET status lampu otomatis
router.post('/auto', (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled boolean required' });
  }
  autoLampEnabled = enabled;
  // Emit ke client
  const io = req.io;
  if (io) {
    io.emit('auto_lamp_update', {
      autoLampEnabled,
      timestamp: new Date().toISOString()
    });
  }
  // Publish ke MQTT agar perangkat bisa menyesuaikan (optional retain)
  mqttClient.publish('arduino/lamp/auto', enabled ? 'AUTO_ON' : 'AUTO_OFF', { qos: 1, retain: true });
  res.json({ success: true, autoLampEnabled });
});

// Endpoint untuk toggle lampu tetap dipertahankan
router.post('/toggle', async (req, res) => {
  try {
    const { currentStatus } = req.body;
    // Blok jika otomatis aktif
    if (autoLampEnabled) {
      return res.status(409).json({
        error: 'Lampu otomatis aktif. Nonaktifkan terlebih dahulu untuk kontrol manual.'
      });
    }
    const newStatus = !currentStatus;
    lampStatus = newStatus;

    console.log(`Toggling lamp from ${currentStatus} to ${newStatus}`);

    // Kirim perintah ke Arduino melalui MQTT
    const command = newStatus ? 'LAMP_ON' : 'LAMP_OFF';
    mqttClient.publish('arduino/lamp', command, (err) => {
      if (err) {
        console.error('Error publishing to MQTT:', err);
        return res.status(500).json({ error: 'Failed to send command to Arduino' });
      }
      console.log(`Command sent to Arduino via MQTT: ${command}`);
    });

    // Emit update ke semua client via Socket.IO
    const io = req.io;
    if (io) {
      io.emit('lamp_update', {
        lampStatus: newStatus,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: `Lamp turned ${newStatus ? 'ON' : 'OFF'}`,
      status: newStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error toggling lamp:', error);
    res.status(500).json({ error: 'Failed to toggle lamp' });
  }
});

// Endpoint untuk mengatur kontrol manual
// Deprecated: manual control digantikan oleh lampu otomatis. Pertahankan sementara untuk kompatibilitas lama.
router.post('/controlManual', (req, res) => {
  console.log('Endpoint /controlManual hit');
  const { command } = req.body; // command: "MANUAL_ON" atau "MANUAL_OFF"
  console.log(`Received controlManual command: ${command}`);
  if (command === 'MANUAL_ON' || command === 'MANUAL_OFF') {
  mqttClient.publish('arduino/controlManual', command, { qos: 1, retain: true }, (err) => {
      if (err) {
        console.error('Error publishing to MQTT:', err);
        return res.status(500).json({ error: 'Failed to send command to Arduino' });
      }
      console.log(`Command sent to Arduino: ${command}`);
      // Emit ke semua client tentang perubahan status kontrol manual
      const io = req.io;
      if (io) {
        io.emit('control_manual_update', {
          controlManual: command === 'MANUAL_ON',
          timestamp: new Date().toISOString(),
        });
      }
      res.json({ success: true, message: `Control manual set to ${command}` });
    });
  } else {
    res.status(400).json({ error: 'Invalid command' });
  }
});

// Alias agar mount di "/api/controlManual" langsung menembak endpoint ini
// Deprecated alias
router.post('/', (req, res) => {
  console.log('Endpoint / (alias controlManual) hit');
  const { command } = req.body; // command: "MANUAL_ON" atau "MANUAL_OFF"
  console.log(`Received controlManual command via alias: ${command}`);
  if (command === 'MANUAL_ON' || command === 'MANUAL_OFF') {
  mqttClient.publish('arduino/controlManual', command, { qos: 1, retain: true }, (err) => {
      if (err) {
        console.error('Error publishing to MQTT:', err);
        return res.status(500).json({ error: 'Failed to send command to Arduino' });
      }
      console.log(`Command sent to Arduino: ${command}`);
      // Emit ke semua client tentang perubahan status kontrol manual
      const io = req.io;
      if (io) {
        io.emit('control_manual_update', {
          controlManual: command === 'MANUAL_ON',
          timestamp: new Date().toISOString(),
        });
      }
      res.json({ success: true, message: `Control manual set to ${command}` });
    });
  } else {
    res.status(400).json({ error: 'Invalid command' });
  }
});

export default router;