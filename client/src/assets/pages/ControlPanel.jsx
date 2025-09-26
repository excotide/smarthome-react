// ControlPanel.jsx
import { Lightbulb, Settings, Thermometer } from 'lucide-react';
import { useState } from 'react';

const ControlPanel = ({ sensorData, darkMode }) => {
  const [isToggling, setIsToggling] = useState(false);

  const toggleLamp = async () => {
    if (isToggling) return; // Prevent multiple clicks
    
    setIsToggling(true);
    
    try {
      // Kirim command ke server untuk toggle lampu
      const response = await fetch('http://localhost:3000/api/lamp/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentStatus: sensorData.lampStatus,
          action: 'toggle'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle lamp');
      }
      
      const result = await response.json();
      console.log('Lamp toggled:', result);
      
      // Data akan otomatis update melalui useSensorData hook
      // yang mendengarkan socket atau polling API
      
    } catch (error) {
      console.error('Error toggling lamp:', error);
      // Optional: show error notification
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
                className={sensorData.lampStatus ? 'text-yellow-400' : 'text-gray-400'}
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
                  {sensorData.lampStatus ? 'Menyala' : 'Mati'}
                  {sensorData.lightLevel < 30 && ' (Auto Mode)'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleLamp}
              disabled={isToggling}
              className={`toggle-switch ${
                sensorData.lampStatus
                  ? 'bg-indigo-600'
                  : 'bg-gray-300'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${
                isToggling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className={`${
                sensorData.lampStatus ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-4 w-4 rounded-full bg-white transition-transform`} />
              
              {/* Loading indicator */}
              {isToggling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className={`panel rounded-xl shadow p-6 border ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent'
        }`}>
          <h2 className={`panel-header text-xl font-bold mb-6 flex items-center ${
            darkMode ? 'text-slate-50' : 'text-slate-900'
          }`}>
            <Settings className="mr-2 text-indigo-600" />
            Settings
          </h2>
          
          <div className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
            darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="item-info flex items-center gap-3">
              <Thermometer size={24} className="text-red-400" />
              <div>
                <h3 className={`font-medium ${
                  darkMode ? 'text-slate-50' : 'text-slate-900'
                }`}>
                  Auto Mode
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-200' : 'text-gray-500'
                }`}>
                  Lampu menyala otomatis saat gelap atau ada gerakan
                </p>
              </div>
            </div>
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              ENABLED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;