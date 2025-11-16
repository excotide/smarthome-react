import { useState } from 'react';
import { Home, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi
    if (!username || !password) {
      setError('Username dan password harus diisi');
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ubah dari email -> username
      const validUsers = [
        { username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' },
        { username: 'user', password: 'user123', name: 'Regular User', role: 'user' }
      ];

      const foundUser = validUsers.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        const userData = {
          id: Date.now(),
          name: foundUser.name,
          username: foundUser.username,
          role: foundUser.role,
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('smarthome_user', JSON.stringify(userData));

        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
      } else {
        setError('Username atau password salah!');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('user');
      setPassword('user123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">

      {/* LOGIN FORM */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-4 shadow-2xl">
              <Home className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Smart Home</h1>
            <p className="text-blue-100">Kontrol rumah pintar Anda</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin / user"
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
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
