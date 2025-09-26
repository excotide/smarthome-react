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
    gasDetected: false,
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

      // Initial data fetch
      fetch(`${API_BASE}/api/sensors?limit=1`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch initial data'))))
        .then((rows) => {
          const latest = Array.isArray(rows) ? rows[0] : null;
          applyServerData(latest);
        })
        .catch((err) => {
          console.warn('[sensorData] initial fetch failed:', err?.message || err);
        });

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