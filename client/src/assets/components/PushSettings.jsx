import { useEffect, useState } from 'react';
import usePushNotifications from '../hooks/usePushNotifications.js';

export default function PushSettings({ userId, darkMode }) {
  const { subscribed, loading, error, subscribe, unsubscribe } = usePushNotifications(userId);
  const [settings, setSettings] = useState({ gas: true, flame: true, rain: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3000/api/users/${userId}/push-settings`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => {});
  }, [userId]);

  const toggle = (key) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const resp = await fetch(`http://localhost:3000/api/users/${userId}/push-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!resp.ok) throw new Error('Gagal simpan pengaturan');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Panel style mirip control panel lampu
  return (
    <div className={`panel rounded-xl shadow p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent'} mt-2`}>
      <h2 className={`panel-header text-xl font-bold mb-6 flex items-center ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
        <span className="mr-2 text-indigo-600">🔔</span>
        Push Notifikasi
      </h2>
      <p className={`text-sm mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-500'}`}>Aktifkan izin browser agar notifikasi muncul saat panel tertutup.</p>

      <div className="space-y-4 mb-6">
        {['gas','flame','rain'].map(k => (
          <div key={k} className={`control-item flex items-center justify-between p-4 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="item-info flex items-center gap-3">
              <span className={`inline-block w-6 text-xl ${k === 'gas' ? 'text-rose-500' : k === 'flame' ? 'text-yellow-400' : 'text-blue-400'}`}>{k === 'gas' ? '🧪' : k === 'flame' ? '🔥' : '🌧️'}</span>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>{k === 'gas' ? 'Gas' : k === 'flame' ? 'Api' : 'Hujan'}</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-200' : 'text-gray-500'}`}>Notifikasi saat {k === 'gas' ? 'gas berbahaya' : k === 'flame' ? 'api terdeteksi' : 'hujan terdeteksi'}</p>
              </div>
            </div>
            {/* Centang dihilangkan */}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        {!subscribed ? (
          <button
            disabled={loading}
            onClick={subscribe}
            className={`px-3 py-1 rounded text-sm font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50`}
          >
            {loading ? 'Meminta izin...' : 'Izinkan'}
          </button>
        ) : (
          <button
            disabled={loading}
            onClick={unsubscribe}
            className={`px-3 py-1 rounded text-sm font-semibold transition bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50`}
          >
            {loading ? '...' : 'Tolak'}
          </button>
        )}
        {/* Tombol simpan preferensi dihilangkan */}
      </div>

      {error && <div className="text-xs text-rose-500 mt-2">{error}</div>}
      <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status: {subscribed ? 'Terdaftar' : 'Belum'}</div>
    </div>
  );
}
