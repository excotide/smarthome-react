import { Lightbulb } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import PushSettings from '../components/PushSettings.jsx';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const ControlPanel = ({ sensorData, darkMode, user }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [lampStatus, setLampStatus] = useState(sensorData.lampStatus);
  const [autoLampEnabled, setAutoLampEnabled] = useState(true); // status sinkron server
  const [pendingAuto, setPendingAuto] = useState(false); // spinner saat toggle
  const socketRef = useRef(null);

  // Inisialisasi socket & fetch status otomatis
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    }
    const s = socketRef.current;

    const onLamp = (data) => setLampStatus(data.lampStatus);
    const onAutoLamp = (data) => {
      setAutoLampEnabled(Boolean(data.autoLampEnabled));
      setPendingAuto(false);
    };

    s.on('lamp_update', onLamp);
    s.on('auto_lamp_update', onAutoLamp);

    // initial fetch combined state
    fetch(`${SOCKET_URL}/api/lamp/state`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => {
        if (typeof j.lampStatus === 'boolean') setLampStatus(j.lampStatus);
        if (typeof j.autoLampEnabled === 'boolean') setAutoLampEnabled(j.autoLampEnabled);
      })
      .catch((e) => console.warn('Failed fetch lamp/state', e));

    return () => {
      s.off('lamp_update', onLamp);
      s.off('auto_lamp_update', onAutoLamp);
    };
  }, []);

  // Tombol nyala/mati lampu 
  const toggleLamp = async () => {
    // Jangan bisa ditekan jika otomatis aktif
    if (isToggling || autoLampEnabled) return;

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

  const toggleAutoLamp = async () => {
    if (pendingAuto) return;
    setPendingAuto(true);
    const target = !autoLampEnabled;
    try {
      const resp = await fetch(`${SOCKET_URL}/api/lamp/auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: target })
      });
      if (!resp.ok) throw new Error('Failed to toggle auto lamp');
      // final state ditunggu dari socket event auto_lamp_update
    } catch (e) {
      console.error(e);
      setPendingAuto(false);
    }
  };

  return (
    <div className="control-panel space-y-8">
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

          {/* Parent: Lampu Otomatis */}
          <div className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
            darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="item-info flex items-center gap-3">
              <Lightbulb size={24} className={autoLampEnabled ? 'text-yellow-400' : 'text-gray-400'} />
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                  Lampu Otomatis
                </h3>
                <p className={`text-sm ${darkMode ? 'text-slate-200' : 'text-gray-500'}`}>
                  lampu akan menyala otomatis jika cahaya sekitar redup
                </p>
              </div>
            </div>
            <button
              onClick={toggleAutoLamp}
              className={`toggle-switch ${
                autoLampEnabled ? 'bg-indigo-600' : 'bg-gray-300'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0`}
            >
              <span className={`${
                autoLampEnabled ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-4 w-4 rounded-full bg-white transition-transform`} />
              {pendingAuto && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>

          {/* Child: Lamp Control (disabled saat otomatis aktif) */}
          <div className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
            darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="item-info flex items-center gap-3">
              <Lightbulb
                size={24}
                className={lampStatus ? 'text-gray-400' : 'text-yellow-400'}
              />
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                  Lampu Utama
                </h3>
                <p className={`text-sm ${darkMode ? 'text-slate-200' : 'text-gray-500'}`}>
                  {autoLampEnabled ? 'Otomatis' : (lampStatus ? 'Menyala' : 'Mati')}
                </p>
                {autoLampEnabled && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                    Nonaktifkan Otomasi Lampu untuk kontrol manual.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={toggleLamp}
              disabled={isToggling || autoLampEnabled}
              className={`toggle-switch ${lampStatus ? 'bg-indigo-600' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${ (isToggling || autoLampEnabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`${lampStatus ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 rounded-full bg-white transition-transform`} />
              
              {/* Loading indicator */}
              {isToggling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>

          {/* Kontrol Manual dihapus - Lampu Otomatis menggantikannya */}
        </div>
        {/* Push Settings */}
        <div className="mt-4">
          <PushSettings userId={user?._id} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;