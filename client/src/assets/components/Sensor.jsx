const Sensor = ({ 
  sensorDetected,
  sensorName, 
  icon: Icon, // Tambahkan properti icon
  alertType = "blue", // Default alert type is blue
  trueCondition, 
  falseCondition, 
  trueStatus,
  falseStatus,
  darkMode // Tambahkan properti darkMode
}) => {
  // Determine styles based on alertType, sensorDetected, and darkMode
  const containerStyles = alertType === "red"
    ? sensorDetected
      ? darkMode
        ? 'bg-red-900/70 border-red-600 animate-pulse'
        : 'bg-red-50 border-red-300 animate-pulse'
      : darkMode
        ? 'bg-slate-700/=70 border-slate-600'
        : 'bg-gray-50 border-gray-200'
    : sensorDetected
      ? darkMode
        ? 'bg-blue-900/70 border-blue-600'
        : 'bg-blue-50 border-blue-300'
      : darkMode
        ? 'bg-slate-700/70 border-slate-600'
        : 'bg-gray-50 border-gray-200';

  const iconStyles = alertType === "red"
    ? sensorDetected
      ? darkMode
        ? 'text-red-400'
        : 'text-red-600'
      : 'text-gray-400'
    : sensorDetected
      ? darkMode
        ? 'text-blue-400'
        : 'text-blue-600'
      : 'text-gray-400';

  const badgeStyles = alertType === "red"
    ? sensorDetected
      ? darkMode
        ? 'bg-red-900 text-red-200'
        : 'bg-red-100 text-red-800'
      : darkMode
        ? 'bg-slate-600 text-slate-300'
        : 'bg-gray-100 text-gray-700'
    : sensorDetected
      ? darkMode
        ? 'bg-blue-900 text-blue-200'
        : 'bg-blue-100 text-blue-800'
      : darkMode
        ? 'bg-slate-600 text-slate-300'
        : 'bg-gray-100 text-gray-700';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg mb-6 border-2 ${containerStyles}`}>
      <div className="flex items-center gap-3">
        {/* Gunakan properti icon untuk merender ikon */}
        {Icon && <Icon size={24} className={iconStyles} />}
        <div>
          <h3 className={`font-medium ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>{sensorName}</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            {sensorDetected ? trueCondition : falseCondition}
          </p>
        </div>
      </div>
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${badgeStyles}`}>
        {sensorDetected ? trueStatus : falseStatus}
      </span>
    </div>
  );
};

export default Sensor;