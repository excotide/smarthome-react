import { useEffect, useState } from 'react';

const useAlerts = (sensorData) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = [];
    if (sensorData.fireDetected) {
      newAlerts.push({ type: 'danger', message: 'BAHAYA! Terdeteksi Api/Asap!' });
    }
    if (sensorData.rainDetected) {
      newAlerts.push({ type: 'warning', message: 'Hujan Terdeteksi' });
    }
    setAlerts(newAlerts);
  }, [sensorData.fireDetected, sensorData.rainDetected]);

  return alerts;
};

export default useAlerts;