import { useState, useEffect } from 'react';

const History = ({ data }) => {
  const [sensorData, setSensorData] = useState([]);

  // Fetch data dari API jika tidak ada props data
  useEffect(() => {
    if (!data) {
      fetchSensorData();
    } else {
      setSensorData(data);
    }
  }, [data]);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sensors?limit=10');
      if (response.ok) {
        const result = await response.json();
        setSensorData(result || []);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setSensorData([]);
    }
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-3 mt-3">Riwayat Terbaru</h4>
      <div className="backdrop-blur-sm backdrop-opacity-50 bg-gray-950/50 rounded-2xl shadow-md p-4 mt-3 overflow-x-auto">
        <table className="min-w-full text-sm rounded-lg overflow-hidden bg-gray-950/10">
          <thead className="backdrop-blur-sm backdrop-opacity-50 bg-gray-950/10">
            <tr>
              <th className="px-3 py-2 text-white">Waktu</th>
              <th className="px-3 py-2 text-white">Flame</th>
              <th className="px-3 py-2 text-white">MQ2</th>
              <th className="px-3 py-2 text-white">Rain</th>
              <th className="px-3 py-2 text-white">Lux</th>
            </tr>
          </thead>
          <tbody>
            {sensorData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-2 text-center text-white">Belum ada data</td>
              </tr>
            ) : (
              sensorData.map((row, i) => (
                <tr key={i} className="odd:bg-white/10 even:bg-white/0">
                  <td className="px-3 py-1 text-center text-white">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-1 text-center text-white">{row.flame}</td>
                  <td className="px-3 py-1 text-center text-white">{row.mq2}</td>
                  <td className="px-3 py-1 text-center text-white">{row.rain}</td>
                  <td className="px-3 py-1 text-center text-white">{row.lux ? row.lux.toFixed(2) : '0.00'}</td>
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