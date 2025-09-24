import express from "express";
import Sensor from "../models/Sensor.js";

const router = express.Router();

// POST data sensor baru
router.post("/", async (req, res) => {
  try {
    const data = new Sensor(req.body);
    const saved = await data.save();

    // broadcast ke client via socket.io
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

export default router;
