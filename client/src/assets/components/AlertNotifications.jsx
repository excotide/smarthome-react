import { AlertTriangle } from 'lucide-react';

// Desain mengikuti gaya ExitWindow: glassmorphism card dengan backdrop blur
// Alerts ditampilkan sebagai overlay terpusat (atau bisa diubah ke top-right sesuai kebutuhan)
import { useCallback } from 'react';

const AlertNotifications = ({ alerts, darkMode, onClose }) => {
  if (!alerts || alerts.length === 0) return null;

  // Tutup alert saat overlay diklik
  const handleClose = useCallback((e) => {
    // Hanya tutup jika klik di backdrop, bukan di card
    if (e.target === e.currentTarget && typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[180] flex justify-center items-start pt-6 backdrop-blur-md bg-black/30"
      onClick={handleClose}
      role="presentation"
      tabIndex={-1}
    >
      <div className="w-full max-w-sm mx-4 flex flex-col gap-4">
        {alerts.map((alert, index) => {
          const danger = alert.type === 'danger';
          const baseCard = `rounded-2xl shadow-xl border backdrop-blur-xl p-4 flex gap-3 items-start transition`;
          const colorClasses = danger
            ? darkMode
              ? 'bg-red-900/30 border-red-700 text-red-100'
              : 'bg-red-100/80 border-red-300 text-red-800'
            : darkMode
              ? 'bg-amber-900/30 border-amber-700 text-amber-100'
              : 'bg-amber-100/80 border-amber-300 text-amber-800';
          return (
            <div key={index} className={`${baseCard} ${colorClasses}`}>
              <div className="mt-0.5">
                <AlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">
                  {danger ? 'Peringatan Bahaya' : 'Peringatan'}
                </p>
                <p className="text-sm leading-relaxed">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertNotifications;