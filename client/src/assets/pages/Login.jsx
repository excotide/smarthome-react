import { useState } from 'react';
import { Home, Lock, Mail, Eye, EyeOff, AlertCircle, User } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  // Mode: login atau register
  const [isRegister, setIsRegister] = useState(false);

  // Field form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const API_BASE = 'http://localhost:3000'; // sesuaikan jika server beda port

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Validasi dasar
    if (isRegister) {
      if (!name || !email || !password) {
        setError('Semua field wajib diisi');
        setLoading(false);
        return;
      }
    } else {
      if (!email || !password) {
        setError('Email dan password wajib diisi');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
      const body = isRegister ? { name, email, password } : { email, password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Gagal proses');
        return;
      }

      if (isRegister) {
        setSuccessMsg('Registrasi berhasil. Silakan login.');
        // Setelah register, kosongkan password agar user yakin isi ulang
        setPassword('');
        setIsRegister(false);
      } else {
        // Login berhasil
        const userData = data.user || data; // server mengembalikan { user: {...}, message: ... }
        localStorage.setItem('smarthome_user', JSON.stringify(userData));
        localStorage.setItem('loggedIn', 'true');
        // Dispatch event untuk Root (main.jsx)
        window.dispatchEvent(new Event('auth:login'));
        if (onLoginSuccess) onLoginSuccess(userData);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError('');
    setSuccessMsg('');
    setIsRegister(prev => !prev);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-slate-900 dark:text-slate-50 font-poppins">

      {/* Tombol kembali ke Landing Page (gaya sama seperti tombol Login di landing) */}
      <button
        onClick={() => {
          // bersihkan sesi lalu kembali ke landing
          localStorage.removeItem('smarthome_user');
          localStorage.removeItem('loggedIn');
          window.location.href = '/';
        }}
        className="absolute top-5 left-6 px-4 py-2 rounded-full border border-zinc-100/70 text-zinc-100 hover:bg-zinc-100/10 transition z-20"
      >
        Kembali
      </button>

      {/* LOGIN FORM */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-4 shadow-2xl">
              <Home className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Smart Home</h1>
            <p className="text-gray-600 dark:text-gray-300">{isRegister ? 'Buat akun baru' : 'Masuk untuk mulai mengontrol'}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Error!</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">Sukses!</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{successMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                {loading ? 'Memproses...' : (isRegister ? 'Register' : 'Login')}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Register'}
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
