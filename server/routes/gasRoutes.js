import express from "express";
import Sensor from "../models/Sensor.js";

const router = express.Router();

// GET latest gas reading
router.get("/", async (req, res) => {
  try {
    const latest = await Sensor.findOne().sort({ createdAt: -1 });
    if (!latest) return res.json({ data: null, message: "No sensor data yet" });

    res.json({
      data: {
        mq2: latest.mq2,
        gas_status: latest.gas_status,
        statusText: latest.gas_status === 0 ? "BAHAYA" : "AMAN",
        createdAt: latest.createdAt
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET gas history (optionally only danger events)
router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const dangerOnly = req.query.dangerOnly === "true";
    const filter = dangerOnly ? { gas_status: 0 } : {}; // 0 = gas detected
    const docs = await Sensor.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json({
      count: docs.length,
      data: docs.map(d => ({
        mq2: d.mq2,
        gas_status: d.gas_status,
        statusText: d.gas_status === 0 ? "BAHAYA" : "AMAN",
        createdAt: d.createdAt
      }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;