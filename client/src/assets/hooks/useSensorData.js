import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Helper to infer API base when not provided via env
function getApiBase() {
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    return isHttps ? 'https://localhost:3000' : 'http://localhost:3000';
  }
  return 'http://localhost:3000';
}

const useSensorData = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 28.5,
    humidity: 65,
    lightLevel: 45,
    gasDetected: false,
    rainDetected: false,
    fireDetected: false,
    motionDetected: false,
    lampStatus: false,
    connectionStatus: false,
  });

  useEffect(() => {
    // Prefer env var if available (set VITE_API_BASE in client/.env)
    const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || getApiBase();

    const luxToPercent = (lux) => {
      if (typeof lux !== 'number') return 0;
      return Math.max(0, Math.min(100, Math.round((lux / 1000) * 100)));
    };

    const applyServerData = (row) => {
      if (!row) return;
      setSensorData((prev) => {
        const nextLight = luxToPercent(row.lux);
        const rainDetected = row.rain === 0;
        const fireDetected = row.flame === 0;
        const motionDetected = prev.motionDetected;
        const gasDetected = row.mq2 === 0;

        return {
          ...prev,
          humidity: typeof row.mq2 === 'number' ? prev.humidity : prev.humidity,
          lightLevel: nextLight,
          gasDetected,
          rainDetected,
          fireDetected,
          motionDetected,
          lampStatus: nextLight < 30 || motionDetected,
        };
      });
    };

    fetch(`${API_BASE}/api/sensors?limit=1`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch initial data'))))
      .then((rows) => {
        const latest = Array.isArray(rows) ? rows[0] : null;
        applyServerData(latest);
      })
      .catch((err) => {
        // Optional: log initial fetch error for visibility
        console.warn('[sensorData] initial fetch failed:', err?.message || err);
      });

    // Allow polling fallback and robust reconnection settings
    const socket = io(API_BASE, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: true,
    });

    socket.on('connect', () => {
      setSensorData((p) => ({ ...p, connectionStatus: true }));
    });
    socket.on('disconnect', () => {
      setSensorData((p) => ({ ...p, connectionStatus: false }));
    });
    socket.on('connect_error', (err) => {
      console.error('[socket connect_error]', err?.message || err);
      setSensorData((p) => ({ ...p, connectionStatus: false }));
    });
    socket.on('error', (err) => {
      console.error('[socket error]', err);
    });
    socket.on('sensor_update', (payload) => {
      applyServerData(payload);
    });

    return () => {
      socket.close();
    };
  }, []);

  return [sensorData, setSensorData];
};

export default useSensorData;