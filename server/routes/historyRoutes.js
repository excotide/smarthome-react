import express from "express";
import Sensor from "../models/Sensor.js";

const router = express.Router();

// GET /api/history
// Mengembalikan daftar event perubahan untuk flame/gas/rain berdasarkan dokumen Sensor yang sudah di-dedup.
// Query:
// - limit: jumlah maksimum event yang dikembalikan (default 100)
// - window: jumlah dokumen sensor yang akan dipindai (default 150) — di-scan dari terbaru ke lama.
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const windowSize = Math.min(parseInt(req.query.window) || 150, 1000);

    // Ambil window dokumen terbaru + 1 supaya bisa dibandingkan dengan yang lebih lama
    const docs = await Sensor.find({})
      .sort({ createdAt: -1 })
      .limit(windowSize + 1)
      .lean();

    if (!docs || docs.length === 0) {
      return res.json({ count: 0, events: [] });
    }

    const events = [];
    for (let i = 0; i < docs.length - 1; i++) {
      const cur = docs[i];
      const prev = docs[i + 1];

      // Pastikan angka
      const curFlame = Number(cur.flame);
      const prevFlame = Number(prev.flame);
      const curGasStatus = cur.gas_status !== undefined ? Number(cur.gas_status) : (Number(cur.mq2) > 500 ? 0 : 1);
      const prevGasStatus = prev.gas_status !== undefined ? Number(prev.gas_status) : (Number(prev.mq2) > 500 ? 0 : 1);
      const curRain = Number(cur.rain);
      const prevRain = Number(prev.rain);

      // Flame change (0 = api terdeteksi, 1 = aman)
      if (!Number.isNaN(curFlame) && !Number.isNaN(prevFlame) && curFlame !== prevFlame) {
        events.push({
          field: "flame",
          type: curFlame === 0 ? "danger" : "success",
          message: curFlame === 0 ? "Api terdeteksi" : "Api aman",
          at: cur.createdAt,
          snapshot: {
            flame: curFlame,
            gas_status: curGasStatus,
            rain: curRain,
            mq2: cur.mq2,
            lux: cur.lux,
          },
        });
      }

      // Gas change (0 = bahaya, 1 = aman)
      if (!Number.isNaN(curGasStatus) && !Number.isNaN(prevGasStatus) && curGasStatus !== prevGasStatus) {
        events.push({
          field: "gas",
          type: curGasStatus === 0 ? "danger" : "success",
          message: curGasStatus === 0 ? "Gas terdeteksi" : "Gas aman",
          at: cur.createdAt,
          snapshot: {
            flame: curFlame,
            gas_status: curGasStatus,
            rain: curRain,
            mq2: cur.mq2,
            lux: cur.lux,
          },
        });
      }

      // Rain change (0 = hujan, 1 = tidak hujan)
      if (!Number.isNaN(curRain) && !Number.isNaN(prevRain) && curRain !== prevRain) {
        events.push({
          field: "rain",
          type: curRain === 0 ? "warning" : "success",
          message: curRain === 0 ? "Hujan terdeteksi" : "Hujan berhenti",
          at: cur.createdAt,
          snapshot: {
            flame: curFlame,
            gas_status: curGasStatus,
            rain: curRain,
            mq2: cur.mq2,
            lux: cur.lux,
          },
        });
      }

      if (events.length >= limit) break;
    }

    // Batasi sesuai limit diminta
    const result = events.slice(0, limit);

    // === Durations (berapa lama terdeteksi) ===
    // Gunakan window dokumen terbaru lalu dibalik agar kronologis
    const asc = docs.slice().reverse();

    const toTs = (d) => (d?.createdAt instanceof Date ? d.createdAt.getTime() : new Date(d?.createdAt || Date.now()).getTime());
    const detectFlame = (d) => Number(d?.flame) === 0; // 0 = api terdeteksi
    const detectGas = (d) => {
      const has = d?.gas_status !== undefined && d?.gas_status !== null;
      const gasStatus = has ? Number(d.gas_status) : (Number(d?.mq2) > 500 ? 0 : 1);
      return gasStatus === 0; // 0 = gas terdeteksi
    };
    const detectRain = (d) => Number(d?.rain) === 0; // 0 = hujan

    const humanizeMs = (ms) => {
      if (ms < 1000) return `${ms} ms`;
      const s = Math.floor(ms / 1000);
      if (s < 60) return `${s} detik`;
      const m = Math.floor(s / 60);
      const rs = s % 60;
      if (m < 60) return rs ? `${m}m ${rs}s` : `${m}m`;
      const h = Math.floor(m / 60);
      const rm = m % 60;
      return rm ? `${h}j ${rm}m` : `${h}j`;
    };

    const buildSessions = (arr, detector) => {
      const sessions = [];
      let inSession = false;
      let startTs = null;
      let startIso = null;
      for (let i = 0; i < arr.length; i++) {
        const d = arr[i];
        const detected = detector(d);
        const ts = toTs(d);
        if (detected && !inSession) {
          inSession = true;
          startTs = ts;
          startIso = d.createdAt;
        } else if (!detected && inSession) {
          inSession = false;
          const endIso = d.createdAt;
          const durationMs = Math.max(0, ts - startTs);
          sessions.push({ start: startIso, end: endIso, durationMs, durationText: humanizeMs(durationMs), ongoing: false });
          startTs = null;
          startIso = null;
        }
      }
      // Jika sesi masih berjalan sampai data terakhir
      if (inSession && startTs != null) {
        const last = arr[arr.length - 1];
        const tsEnd = toTs(last);
        const durationMs = Math.max(0, tsEnd - startTs);
        sessions.push({ start: startIso, end: last.createdAt, durationMs, durationText: humanizeMs(durationMs), ongoing: true });
      }
      return sessions;
    };

    const durations = {
      flame: buildSessions(asc, detectFlame),
      gas: buildSessions(asc, detectGas),
      rain: buildSessions(asc, detectRain),
    };

    res.json({ count: result.length, events: result, durations });
  } catch (e) {
    console.error("/api/history error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
