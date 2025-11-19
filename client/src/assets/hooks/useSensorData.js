import { useState, useEffect, useRef } from 'react';
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
    gasDetected: false, // true jika gas_status === 0 (bahaya)
    gasStatusRaw: 1,    // nilai asli gas_status
    mq2Raw: null,       // nilai analog mq2
    rainDetected: false,
    fireDetected: false,
    motionDetected: false,
    lampStatus: false,
    connectionStatus: false,
  });

  // Refs untuk manage connection lifecycle
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
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
        // Prefer gas_status (0 = bahaya) fallback ke konvensi lama mq2===0 jika belum tersedia
        const hasGasStatus = row.gas_status !== undefined;
        const gasStatusRaw = hasGasStatus ? Number(row.gas_status) : (row.mq2 === 0 ? 0 : 1);
        const gasDetected = gasStatusRaw === 0;
        const mq2Raw = typeof row.mq2 === 'number' ? row.mq2 : (typeof row.mq2_raw === 'number' ? row.mq2_raw : null);
        return {
          ...prev,
          lightLevel: nextLight,
          gasDetected,
          gasStatusRaw,
          mq2Raw,
          rainDetected,
          fireDetected,
          motionDetected,
          lampStatus: nextLight < 30 || motionDetected,
        };
      });
    };

    // Cleanup existing socket jika ada
    const cleanupSocket = () => {
      if (socketRef.current) {
        console.log('[socket] Cleaning up existing connection');
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
        isConnectedRef.current = false;
      }
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    // Handle page refresh/unload - Force disconnect
    const handleBeforeUnload = () => {
      console.log('[socket] Page unloading, forcing disconnect');
      cleanupSocket();
    };

    // Handle visibility change - Reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && !isConnectedRef.current && !socketRef.current) {
        console.log('[socket] Tab visible, reconnecting...');
        reconnectTimeoutRef.current = setTimeout(() => {
          initializeConnection();
        }, 1000);
      }
    };

    const initializeConnection = () => {
      // Cleanup any existing connection first
      cleanupSocket();

      // Initial data fetch (sensor + gas endpoint untuk memastikan format baru)
      Promise.all([
        fetch(`${API_BASE}/api/sensors?limit=1`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/api/gas`).then(r => r.ok ? r.json() : null)
      ])
        .then(([rows, gasResp]) => {
          const latest = Array.isArray(rows) ? rows[0] : null;
          applyServerData(latest);
          if (gasResp && gasResp.data) {
            applyServerData({
              mq2: gasResp.data.mq2,
              gas_status: gasResp.data.gas_status,
              flame: latest?.flame ?? 1,
              rain: latest?.rain ?? 1,
              lux: latest?.lux ?? 0
            });
          }
        })
        .catch((err) => console.warn('[sensorData] initial fetch failed:', err?.message || err));

      // Create new socket connection
      const socket = io(API_BASE, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 15000,
        withCredentials: true,
        forceNew: true, // Force new connection to prevent reuse
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[socket] Connected successfully');
        isConnectedRef.current = true;
        setSensorData((p) => ({ ...p, connectionStatus: true }));
      });

      socket.on('disconnect', (reason) => {
        console.log('[socket] Disconnected:', reason);
        isConnectedRef.current = false;
        setSensorData((p) => ({ ...p, connectionStatus: false }));
        
        // Auto-reconnect jika disconnect bukan karena client action
        if (reason !== 'io client disconnect') {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isConnectedRef.current) {
              console.log('[socket] Auto-reconnecting...');
              initializeConnection();
            }
          }, 3000);
        }
      });

      socket.on('connect_error', (err) => {
        // Suppress common connection errors untuk reduce noise
        if (!err.message.includes('ECONNREFUSED') && !err.message.includes('websocket')) {
          console.error('[socket connect_error]', err?.message || err);
        }
        isConnectedRef.current = false;
        setSensorData((p) => ({ ...p, connectionStatus: false }));
      });

      socket.on('error', (err) => {
        console.error('[socket error]', err);
      });

      socket.on('sensor_update', (payload) => {
        applyServerData(payload);
      });

      // Realtime ringan: setiap pesan sensor dari MQTT
      socket.on('sensor_live', (payload) => {
        if (!payload) return;
        setSensorData((prev) => {
          const lux = typeof payload.lux === 'number' ? payload.lux : Number(payload.lux);
          const nextLight = luxToPercent(lux);
          const rainDetected = payload.rain != null ? Number(payload.rain) === 0 : prev.rainDetected;
          const fireDetected = payload.flame != null ? Number(payload.flame) === 0 : prev.fireDetected;
          const hasGasStatus = payload.gas_status !== undefined;
          const gasStatusRaw = hasGasStatus ? Number(payload.gas_status) : (payload.mq2 != null ? (Number(payload.mq2) === 0 ? 0 : 1) : prev.gasStatusRaw);
          const gasDetected = gasStatusRaw === 0;
          const mq2Raw = payload.mq2 != null ? Number(payload.mq2) : prev.mq2Raw;
          return {
            ...prev,
            lightLevel: nextLight,
            gasDetected,
            gasStatusRaw,
            mq2Raw,
            rainDetected,
            fireDetected,
          };
        });
      });

      socket.on('lamp_update', (payload) => {
        console.log('[socket] Lamp update received:', payload);
        setSensorData((prev) => ({
          ...prev,
          lampStatus: payload.lampStatus
        }));
      });
    };

    // Add event listeners untuk lifecycle management
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize connection
    initializeConnection();

    // Cleanup function
    return () => {
      console.log('[socket] Component unmounting, cleaning up');
      
      // Remove event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup socket
      cleanupSocket();
    };
  }, []); // Empty dependency untuk run once

  return sensorData;
};

export default useSensorData;