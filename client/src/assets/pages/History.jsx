import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const History = ({ darkMode = false }) => {
  const [events, setEvents] = useState([]);
  const [durations, setDurations] = useState({ flame: [], gas: [], rain: [] });
  const [loading, setLoading] = useState(false);
  const LIMIT = 50;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/history?limit=${LIMIT}&window=${LIMIT * 3}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const json = await res.json();
      setEvents(Array.isArray(json.events) ? json.events : []);
      const durs = json.durations || {};
      setDurations({
        flame: Array.isArray(durs.flame) ? durs.flame : [],
        gas: Array.isArray(durs.gas) ? durs.gas : [],
        rain: Array.isArray(durs.rain) ? durs.rain : [],
      });
    } catch (e) {
      console.error('Error fetching history:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Refresh history setiap ada perubahan sensor_update
  useEffect(() => {
    const onUpdate = () => fetchHistory();
    socket.on('sensor_update', onUpdate);
    return () => socket.off('sensor_update', onUpdate);
  }, []);

  const panelBase = 'panel rounded-xl shadow p-6 border';
  const panelTheme = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent';
  const headerText = darkMode ? 'text-slate-50' : 'text-slate-900';
  const subText = darkMode ? 'text-slate-200' : 'text-gray-500';
  const itemBase = 'rounded-xl border p-4 flex items-start gap-3';
  const toColor = (type) => {
    if (type === 'danger') return darkMode ? 'bg-red-900/30 border-red-700 text-red-100' : 'bg-red-50 border-red-200 text-red-800';
    if (type === 'warning') return darkMode ? 'bg-amber-900/30 border-amber-700 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-800';
    if (type === 'success') return darkMode ? 'bg-emerald-900/30 border-emerald-700 text-emerald-100' : 'bg-emerald-50 border-emerald-200 text-emerald-800';
    return darkMode ? 'bg-slate-700/40 border-slate-600 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700';
  };

  // Build unified session cards from durations
  const sessions = [
    ...durations.flame.map(s => ({ ...s, field: 'flame', label: 'Api' })),
    ...durations.gas.map(s => ({ ...s, field: 'gas', label: 'Gas' })),
    ...durations.rain.map(s => ({ ...s, field: 'rain', label: 'Hujan' })),
  ]
    .sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()) // newest first
    .slice(0, 30); // limit cards
  // Pagination (slider) untuk sesi: tampilkan 3 per halaman
  const pageSize = 3;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(sessions.length / pageSize);
  const visibleSessions = sessions.slice(page * pageSize, page * pageSize + pageSize);
  useEffect(() => { setPage(0); }, [sessions.length]);
  // Warna khusus per jenis: Api merah, Gas kuning, Hujan biru
  const cardColor = (field) => {
    switch(field) {
      case 'flame': // merah
        return darkMode ? 'bg-red-900/40 border-red-700 text-red-100' : 'bg-red-50 border-red-300 text-red-800';
      case 'gas': // kuning
        return darkMode ? 'bg-yellow-900/40 border-yellow-700 text-yellow-100' : 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'rain': // biru
        return darkMode ? 'bg-blue-900/40 border-blue-700 text-blue-100' : 'bg-blue-50 border-blue-300 text-blue-800';
      default:
        return darkMode ? 'bg-slate-700/40 border-slate-600 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className={`${panelBase} ${panelTheme}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold ${headerText}`}>Riwayat Perubahan</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchHistory} className={`text-sm underline ${subText}`}>Refresh</button>
          <span className={`text-sm ${subText}`}>{loading ? 'Memuat...' : `${events.length} entri`}</span>
        </div>
      </div>

      {/* Cards sesi deteksi */}
      <div className="mt-2">
        <h3 className={`text-lg font-semibold mb-4 ${headerText}`}>Sesi Deteksi Terbaru</h3>
        {sessions.length === 0 ? (
          <p className={`${subText}`}>Belum ada sesi terdeteksi.</p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {visibleSessions.map((s, i) => (
                <div key={i} className={`rounded-2xl border p-4 flex flex-col gap-2 ${cardColor(s.field)} backdrop-blur-xl transition-all`}>                
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{s.label}</span>
                    {s.ongoing && <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">Berjalan</span>}
                  </div>
                  <div className="text-xs opacity-80">Mulai: {s.start ? new Date(s.start).toLocaleString() : '-'}</div>
                  {!s.ongoing && <div className="text-xs opacity-80">Selesai: {s.end ? new Date(s.end).toLocaleString() : '-'}</div>}
                  <div className="text-sm font-medium">Durasi: {s.durationText}</div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                  className={`px-3 py-1 rounded-lg text-sm border ${page === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-200/40 dark:hover:bg-slate-700/40'} ${darkMode ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'}`}
                >Prev</button>
                <span className={`text-xs ${subText}`}>{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages - 1}
                  className={`px-3 py-1 rounded-lg text-sm border ${page === totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-200/40 dark:hover:bg-slate-700/40'} ${darkMode ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'}`}
                >Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;