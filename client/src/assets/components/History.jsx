import { Clock } from 'lucide-react';

const History = ({ darkMode }) => {
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
        <Clock className="mr-2 text-indigo-600" />
        History Log
      </h2>
      <div className="history-list flex flex-col gap-4">
        <div
          className={`history-item flex items-center justify-between p-4 rounded-lg border-l-4 ${
            darkMode
              ? 'bg-slate-700 border-blue-400'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <span
            className={`history-time font-semibold text-sm min-w-20 ${
              darkMode ? 'text-slate-100' : 'text-slate-700'
            }`}
          >
            12:30:45
          </span>
          <span
            className={`history-event flex-1 mx-4 text-sm ${
              darkMode ? 'text-slate-200' : 'text-slate-600'
            }`}
          >
            Lampu menyala (Auto Mode - Cahaya rendah)
          </span>
          <span
            className={`status-badge inline-block px-2 py-1 text-xs rounded-full ${
              darkMode ? 'status-badge-green' : 'status-badge-green'
            }`}
          >
            INFO
          </span>
        </div>
      </div>
    </div>
  );
};

export default History