import { AlertTriangle } from 'lucide-react';

const AlertNotifications = ({ alerts, darkMode }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-6">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg mb-2 flex items-center gap-3 animate-pulse border-l-4 ${
            alert.type === 'danger'
              ? darkMode
                ? 'bg-red-900/30 border-red-500 text-red-200'
                : 'bg-red-100 border-red-500 text-red-800'
              : darkMode
              ? 'bg-amber-900/30 border-amber-500 text-amber-200'
              : 'bg-amber-100 border-amber-500 text-amber-800'
          }`}
        >
          <AlertTriangle size={20} />
          <span className="font-medium">{alert.message}</span>
        </div>
      ))}
    </div>
  );
};

export default AlertNotifications;