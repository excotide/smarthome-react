import { Lightbulb, Activity } from 'lucide-react';

const ControlPanel = ({ sensorData, toggleLamp, darkMode }) => {
  return (
    <div
      className={`panel rounded-xl shadow p-6 border ${
        darkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-transparent'
      }`}
    >
      <h2
        className={`panel-header text-xl font-bold mb-6 flex items-center ${
          darkMode ? 'text-slate-50' : 'text-slate-900'
        }`}
      >
        <Lightbulb className="mr-2 text-indigo-600" />
        Control Panel
      </h2>
      <div>
        {/* Lamp Control */}
        <div
          className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
            darkMode
              ? 'bg-slate-700 border-slate-600'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="item-info flex items-center gap-3">
            <Lightbulb
              size={24}
              className={sensorData.lampStatus ? 'icon-yellow' : 'icon-gray'}
            />
            <div>
              <h3
                className={`font-medium ${
                  darkMode ? 'text-slate-50' : 'text-slate-900'
                }`}
              >
                Lampu Utama
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? 'text-slate-200' : 'text-gray-500'
                }`}
              >
                {sensorData.lampStatus ? 'Menyala' : 'Mati'}
                {sensorData.lightLevel < 30 && ' (Auto Mode)'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleLamp}
            className={`toggle-switch ${
              sensorData.lampStatus
                ? 'toggle-switch-on bg-indigo-600'
                : 'toggle-switch-off bg-gray-300'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0`}
          >
            <span
              className={`${
                sensorData.lampStatus ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-4 w-4 rounded-full bg-white transition-transform`}
            />
          </button>
        </div>

        {/* Motion Detection */}
        <div
          className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
            darkMode
              ? 'bg-slate-700 border-slate-600'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="item-info flex items-center gap-3">
            <Activity
              size={24}
              className={sensorData.motionDetected ? 'icon-green' : 'icon-gray'}
            />
            <div>
              <h3
                className={`font-medium ${
                  darkMode ? 'text-slate-50' : 'text-slate-900'
                }`}
              >
                Sensor Gerak
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? 'text-slate-200' : 'text-gray-500'
                }`}
              >
                {sensorData.motionDetected
                  ? 'Gerakan Terdeteksi'
                  : 'Tidak Ada Gerakan'}
              </p>
            </div>
          </div>
          <span
            className={`status-badge inline-block px-2 py-1 text-xs rounded-full ${
              sensorData.motionDetected
                ? 'status-badge-green'
                : 'status-badge-gray'
            }`}
          >
            {sensorData.motionDetected ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;