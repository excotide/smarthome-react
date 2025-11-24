import { Lightbulb, Thermometer } from 'lucide-react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client'; // Pastikan Anda menginstal Socket.IO client

const socket = io('http://localhost:3000'); // Ganti dengan URL server Anda jika online

const ControlPanel = ({ sensorData, darkMode }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [lampStatus, setLampStatus] = useState(sensorData.lampStatus); // Status lampu lokal
  const [controlManual, setControlManual] = useState(false); // Status kontrol manual

  // Dengarkan update status lampu dan control manual dari server
  useEffect(() => {
    socket.on('lamp_update', (data) => {
      console.log('Lamp status updated:', data);
      setLampStatus(data.lampStatus); // Perbarui status lampu
    });

    socket.on('control_manual_update', (data) => {
      console.log('Control manual status updated:', data);
      setControlManual(Boolean(data.controlManual));
    });

    return () => {
      socket.off('lamp_update'); // Bersihkan listener saat komponen unmount
      socket.off('control_manual_update');
    };
  }, []);

  // Tombol nyala/mati lampu 
  const toggleLamp = async () => {
    if (isToggling) return; // Prevent multiple clicks

    setIsToggling(true);

    try {
      const response = await fetch('http://localhost:3000/api/lamp/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStatus: lampStatus, // Gunakan status lokal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle lamp');
      }

      const result = await response.json();
      console.log('Lamp toggled:', result);
    } catch (error) {
      console.error('Error toggling lamp:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const toggleControlManual = async () => {
    if (isToggling) return; // Prevent multiple clicks

    setIsToggling(true);

    try {
      const response = await fetch('http://localhost:3000/api/controlManual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: controlManual ? 'MANUAL_OFF' : 'MANUAL_ON', // Kirim perintah ke MQTT
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle control manual');
      }

  const result = await response.json();
  console.log('Control manual toggled (await server/device state):', result);
  // Jangan update state lokal di sini; tunggu event 'control_manual_update' dari server
    } catch (error) {
      console.error('Error toggling control manual:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="control-panel">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Panel */}
        <div className={`panel rounded-xl shadow p-6 border ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent'
        }`}>
          <h2 className={`panel-header text-xl font-bold mb-6 flex items-center ${
            darkMode ? 'text-slate-50' : 'text-slate-900'
          }`}>
            <Lightbulb className="mr-2 text-indigo-600" />
            Control Panel
          </h2>

          {/* Lamp Control */}
          <div className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
            darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="item-info flex items-center gap-3">
              <Lightbulb
                size={24}
                className={lampStatus ? 'text-gray-400' : 'text-yellow-400'}
              />
              <div>
                <h3 className={`font-medium ${
                  darkMode ? 'text-slate-50' : 'text-slate-900'
                }`}>
                  Lampu Utama
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-200' : 'text-gray-500'
                }`}>
                  {lampStatus ? 'Mati' : 'Menyala'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleLamp}
              disabled={isToggling}
              className={`toggle-switch ${
                lampStatus
                  ? 'bg-gray-300'
                  : 'bg-indigo-600'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${
                isToggling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className={`${
                lampStatus ? 'translate-x-1' : 'translate-x-5'
              } inline-block h-4 w-4 rounded-full bg-white transition-transform`} />
              
              {/* Loading indicator */}
              {isToggling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>

          {/* Kontrol Manual */}
          <div className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
            darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="item-info flex items-center gap-3">
              <Thermometer size={24} className="text-red-400" />
              <div>
                <h3 className={`font-medium ${
                  darkMode ? 'text-slate-50' : 'text-slate-900'
                }`}>
                  Kontrol Manual
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-200' : 'text-gray-500'
                }`}>
                  Saat aktif: hanya manual, otomatis dimatikan
                </p>
              </div>
            </div>
            <button
              onClick={toggleControlManual}
              className={`toggle-switch ${
                controlManual
                  ? 'bg-indigo-600'
                  : 'bg-gray-300'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0`}
            >
              <span className={`${
                controlManual ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-4 w-4 rounded-full bg-white transition-transform`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;