import { useEffect, useMemo, useState } from "react";

const getEnvApiKey = () =>
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENWEATHER_API_KEY) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_OPENWEATHER_API_KEY) ||
  "";

const API_BASE = "https://api.openweathermap.org/data/2.5";

// Ambil 1 data per hari (mendekati jam 12:00)
function groupDailyAtNoon(list) {
  const byDate = new Map();

  for (const item of list) {
    const d = item.dt_txt ? new Date(item.dt_txt) : new Date(item.dt * 1000);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(item);
  }

  const result = [];
  byDate.forEach((items) => {
    let best = items[0];
    let bestDiff = Infinity;
    for (const it of items) {
      const d = it.dt_txt ? new Date(it.dt_txt) : new Date(it.dt * 1000);
      const diff = Math.abs(d.getHours() - 12);
      if (diff < bestDiff) {
        best = it;
        bestDiff = diff;
      }
    }
    result.push(best);
  });

  return result.sort((a, b) => a.dt - b.dt).slice(0, 5);
}

function formatTemp(t, unit) {
  const v = Math.round(t);
  return `${v}°${unit === "metric" ? "C" : "F"}`;
}

function formatDate(dt) {
  const d = typeof dt === "number" ? new Date(dt * 1000) : new Date(dt);
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" });
}

async function safeError(res) {
  try {
    const j = await res.json();
    return (j && (j.message || j.error)) || res.statusText;
  } catch {
    try {
      return await res.text();
    } catch {
      return res.statusText || "Request error";
    }
  }
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const Weather = ({
  defaultCity = "Lamongan",
  apiKey: apiKeyProp,
  units = "metric",
  lang = "id",
  darkMode = false,
}) => {
  const apiKey = apiKeyProp || getEnvApiKey();
  const [city, setCity] = useState(defaultCity);
  const [query, setQuery] = useState(defaultCity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);

  const canFetch = useMemo(() => Boolean(apiKey && apiKey.trim().length > 0), [apiKey]);

  useEffect(() => {
    if (!canFetch || !city) return;

    const ctrl = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setCurrent(null);
        setForecast([]);

        const qs = (p) => new URLSearchParams(p).toString();

        const [curRes, forRes] = await Promise.all([
          fetch(`${API_BASE}/weather?${qs({ q: city, appid: apiKey, units, lang })}`, { signal: ctrl.signal }),
          fetch(`${API_BASE}/forecast?${qs({ q: city, appid: apiKey, units, lang })}`, { signal: ctrl.signal }),
        ]);

        if (!curRes.ok) {
          const msg = await safeError(curRes);
          throw new Error(msg || `Gagal mengambil cuaca saat ini untuk "${city}".`);
        }
        if (!forRes.ok) {
          const msg = await safeError(forRes);
          throw new Error(msg || `Gagal mengambil perkiraan cuaca untuk "${city}".`);
        }

        const curJson = await curRes.json();
        const forJson = await forRes.json();

        setCurrent(curJson);
        setForecast(groupDailyAtNoon(forJson.list || []));
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => ctrl.abort();
  }, [city, apiKey, units, lang, canFetch]);

  if (!canFetch) {
    return (
      <div className={`rounded-xl border shadow p-4 ${darkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-200 bg-white'}`}>
        <h3 className="text-lg font-bold mb-2">Cuaca</h3>
        <p>API key tidak ditemukan.</p>
        <p>
          Tambahkan variable lingkungan:
          <br />- <b>VITE_OPENWEATHER_API_KEY</b> (Vite)
          <br />- atau <b>REACT_APP_OPENWEATHER_API_KEY</b> (CRA)
        </p>
        <p>Atau kirim prop apiKey ke komponen.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kota, misal: Bandung"
          className={`flex-1 px-3 py-2 rounded-lg border outline-none ${darkMode ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400' : 'border-gray-300 bg-white'}`}
        />
        <button
          onClick={() => setCity(query.trim())}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          title="Cari"
        >
          {loading ? "Memuat..." : "Cari"}
        </button>
      </div>

      {error ? (
        <div className={`rounded-xl border p-4 ${darkMode ? 'border-red-600 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>{error}</div>
      ) : (
        <>
          {current && (
            <div className={`rounded-xl border shadow p-4 ${darkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    {current.name}, {current.sys?.country}
                  </h3>
                  <div className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {current.weather?.[0]?.description ? capitalize(current.weather[0].description) : "-"}
                  </div>
                </div>
                {current.weather?.[0]?.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                    alt={current.weather[0].main}
                    className="w-16 h-16"
                  />
                )}
              </div>

              <div className="mt-3 flex items-center gap-4">
                <div className="text-4xl font-bold">{formatTemp(current.main?.temp ?? 0, units)}</div>
                <div className={`grid gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  <div>Terasa: {formatTemp(current.main?.feels_like ?? 0, units)}</div>
                  <div>Kelembapan: {current.main?.humidity ?? "-"}%</div>
                  <div>
                    Angin: {Math.round(current.wind?.speed ?? 0)} {units === "imperial" ? "mph" : "m/s"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {forecast?.length > 0 && (
            <div className={`rounded-xl border shadow p-4 ${darkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-200 bg-white'}`}>
              <h4 className="text-base font-bold mb-3">Perkiraan 5 Hari</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {forecast.map((d) => (
                  <div key={d.dt} className={`border rounded-lg p-3 text-center ${darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="font-semibold mb-1">{formatDate(d.dt_txt ?? d.dt)}</div>
                    {d.weather?.[0]?.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${d.weather[0].icon}.png`}
                        alt={d.weather[0].main}
                        className="w-12 h-12 mx-auto"
                      />
                    )}
                    <div className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-700'}`}>{d.weather?.[0]?.main || "-"}</div>
                    <div className="mt-1 font-medium">
                      <span>{formatTemp(d.main?.temp_min ?? d.main?.temp ?? 0, units)}</span>
                      <span> / </span>
                      <span>{formatTemp(d.main?.temp_max ?? d.main?.temp ?? 0, units)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Weather;