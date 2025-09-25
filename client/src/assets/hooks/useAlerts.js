import { useEffect, useState } from 'react';

const useAlerts = (sensorData) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = [];
    if (sensorData.fireDetected || sensorData.gasDetected) {
      newAlerts.push({ type: 'danger', message: 'BAHAYA! Terdeteksi Api/Gas!' });
    }
    if (sensorData.rainDetected) {
      newAlerts.push({ type: 'warning', message: 'Hujan Terdeteksi' });
    }
    setAlerts(newAlerts);
  }, [sensorData.fireDetected, sensorData.gasDetected, sensorData.rainDetected]);

  return alerts;
};

export default useAlerts;