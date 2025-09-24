const SystemStatus = ({ data, darkMode }) => {
  return (
    <div
      className={`mt-6 p-4 rounded-lg border ${
        darkMode
          ? 'bg-indigo-900/30 border-indigo-700'
          : 'bg-indigo-50 border-indigo-200'
      }`}
    >
      <h4
        className={`font-medium mb-2 ${
          darkMode ? 'text-indigo-100' : 'text-indigo-900'
        }`}
      >
        System Status
      </h4>
      <div
        className={`text-sm space-y-1 ${
          darkMode ? 'text-indigo-200' : 'text-indigo-700'
        }`}
      >
        <p>✅ Semua sensor aktif</p>
        <p>✅ Koneksi WiFi stabil</p>
        <p>✅ Auto lamp: {data.lightLevel < 30 ? 'Enabled' : 'Disabled'}</p>
      </div>
    </div>
  );
};

export default SystemStatus;