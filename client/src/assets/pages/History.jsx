import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const History = ({ data, darkMode = false }) => {
  const [sensorData, setSensorData] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const LIMIT = 10;

  // Helper: kompres daftar agar hanya menyimpan transisi biner (flame/mq2/rain)
  const compressBinaryTransitions = (list) => {
    if (!Array.isArray(list)) return [];
    const out = [];
    let last = null;
    for (const row of list) {
      const cur = {
        f: Number(row?.flame),
        m: Number(row?.mq2),
        r: Number(row?.rain),
      };
      if (!last || cur.f !== last.f || cur.m !== last.m || cur.r !== last.r) {
        out.push(row);
        last = cur;
      }
      if (out.length >= LIMIT) break;
    }
    return out;
  };

  // Helper: ubah 0/1 jadi label deteksi berwarna per sensor
  const detectionNode = (v, type) => {
    if (v === null || v === undefined) return <span>-</span>;
    const detected = Number(v) === 0;
    let label = detected ? 'terdeteksi' : 'tidak terdeteksi';
    switch (type) {
      case 'flame':
        label = detected ? 'Api terdeteksi' : 'Tidak ada api';
        break;
      case 'mq2':
        label = detected ? 'Gas/Asap terdeteksi' : 'Tidak ada gas/asap';
        break;
      case 'rain':
        label = detected ? 'Hujan' : 'Tidak hujan';
        break;
      default:
        break;
    }
    const color = detected ? 'text-red-500' : 'text-green-500';
    return <span className={`${color} font-medium`}>{label}</span>;
  };

  // Fetch data dari API jika tidak ada props data
  useEffect(() => {
    const initFromPropsOrFetch = async () => {
      if (!data) {
        await fetchSensorData();
      } else {
        const filtered = compressBinaryTransitions(data);
        setSensorData(filtered);
        setInitialized(true);
      }
    };
    initFromPropsOrFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Subscribe realtime update dari server (aktif setelah initialized)
  useEffect(() => {
    const onUpdate = (doc) => {
      if (!doc || !initialized) return; // tunda sampai data awal siap
      setSensorData((prev) => {
        const last = prev[0];
        const sameBinary = last &&
          Number(last.flame) === Number(doc.flame) &&
          Number(last.mq2) === Number(doc.mq2) &&
          Number(last.rain) === Number(doc.rain);
        if (sameBinary) return prev; // abaikan update yang sama
        return [doc, ...prev].slice(0, LIMIT);
      });
    };

    socket.on('sensor_update', onUpdate);
    return () => {
      socket.off('sensor_update', onUpdate);
    };
  }, [initialized]);

  const fetchSensorData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/sensors?limit=${LIMIT * 3}`); // ambil lebih banyak lalu kompres
      if (response.ok) {
        const result = await response.json();
        const filtered = compressBinaryTransitions(result);
        setSensorData(filtered);
        setInitialized(true);
      } else {
        setSensorData([]);
        setInitialized(true);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setSensorData([]);
      setInitialized(true);
    }
  };

  const panelBase = 'panel rounded-xl shadow p-6 border';
  const panelTheme = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent';
  const headerText = darkMode ? 'text-slate-50' : 'text-slate-900';
  const subText = darkMode ? 'text-slate-200' : 'text-gray-500';
  const tableHead = darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-50 text-slate-600';
  const tableRowOdd = darkMode ? 'odd:bg-white/5 even:bg-transparent' : 'odd:bg-gray-50 even:bg-transparent';
  const tableCell = darkMode ? 'text-slate-100' : 'text-slate-700';

  return (
    <div className={`${panelBase} ${panelTheme}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold ${headerText}`}>Riwayat Terbaru</h2>
        <span className={`text-sm ${subText}`}>{sensorData.length} entri</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-transparent">
        <table className="min-w-full text-sm">
          <thead className={tableHead}>
            <tr>
              <th className="px-3 py-2 text-left">Waktu</th>
              <th className="px-3 py-2 text-center">Flame</th>
              <th className="px-3 py-2 text-center">MQ2</th>
              <th className="px-3 py-2 text-center">Rain</th>
            </tr>
          </thead>
          <tbody className={tableRowOdd}>
            {sensorData.length === 0 ? (
              <tr>
                <td colSpan={4} className={`px-3 py-4 text-center ${tableCell}`}>Belum ada data</td>
              </tr>
            ) : (
              sensorData.map((row, i) => (
                <tr key={row._id || i}>
                  <td className={`px-3 py-2 ${tableCell}`}>
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className={`px-3 py-2 text-center ${tableCell}`}>{detectionNode(row.flame, 'flame')}</td>
                  <td className={`px-3 py-2 text-center ${tableCell}`}>{detectionNode(row.mq2, 'mq2')}</td>
                  <td className={`px-3 py-2 text-center ${tableCell}`}>{detectionNode(row.rain, 'rain')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;