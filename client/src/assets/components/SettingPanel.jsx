import { Settings, Thermometer } from 'lucide-react';

const SettingsPanel = ({ darkMode }) => {
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
        <Settings className="mr-2 text-indigo-600" />
        Settings
      </h2>
      <div
        className={`control-item flex items-center justify-between p-4 rounded-lg mb-6 border ${
          darkMode
            ? 'bg-slate-700 border-slate-600'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="item-info flex items-center gap-3">
          <Thermometer size={24} className="icon-red" />
          <div>
            <h3
              className={`font-medium ${
                darkMode ? 'text-slate-50' : 'text-slate-900'
              }`}
            >
              Auto Mode
            </h3>
            <p
              className={`text-sm ${
                darkMode ? 'text-slate-200' : 'text-gray-500'
              }`}
            >
              Lampu menyala otomatis saat gelap atau ada gerakan
            </p>
          </div>
        </div>
        <span
          className={`status-badge inline-block px-2 py-1 text-xs rounded-full ${
            darkMode ? 'status-badge-green' : 'status-badge-green'
          }`}
        >
          ENABLED
        </span>
      </div>
    </div>
  );
};

export default SettingsPanel;