import { Clock } from 'lucide-react';

const History = ({ darkMode }) => {
  return (
    <div
      className={`panel rounded-xl shadow p-6 border ${
        darkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`panel-header text-xl font-bold flex items-center ${
            darkMode ? 'text-slate-50' : 'text-slate-900'
          }`}
        >
          <Clock className="mr-2 text-indigo-600" />
          Riwayat Sensor
        </h2>
      </div>

      <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        Tidak ada riwayat tersedia
      </div>
    </div>
  );
};

export default History;