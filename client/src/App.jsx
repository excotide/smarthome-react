import { useState, useEffect } from 'react';

// pages & components
import Navbar from './assets/components/Navbar';
import Header from './assets/components/Header';
import ControlPanel from './assets/pages/ControlPanel';
import History from './assets/pages/History';
import Alert from './assets/components/Alert';
import AlertNotifications from './assets/components/AlertNotifications';
import ExitWindow from './assets/components/ExitWindow';
import Weather from './assets/pages/Weather';

// pages
import Sensor from './assets/pages/Sensor';
import Login from './assets/pages/Login';

// hooks
import useDarkMode from './assets/hooks/useDarkMode';
import useSensorData from './assets/hooks/useSensorData';
import useAlerts from './assets/hooks/useAlerts';

function App() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const sensorData = useSensorData();
  const [alerts, setAlerts] = useAlerts(sensorData);

  const [activeNav, setActiveNav] = useState('sensor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // ===== LOGIKA LOGIN (wajib login sebelum konten ditampilkan) =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('smarthome_user');
    if (stored) {
       setIsLoggedIn(true);
    }
    // Dengarkan event login (dikirim dari komponen Login & LandingNavbar)
    const onLogin = () => setIsLoggedIn(true);
    window.addEventListener('auth:login', onLogin);
    return () => window.removeEventListener('auth:login', onLogin);
  }, []);

  // Jika belum login tampilkan halaman Login (standalone)
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    if (activeNav === 'sensor') {
      return (
          <Sensor darkMode={darkMode} sensorData={sensorData}/>
      );
    }

    if (activeNav === 'control') {
      return (
        <ControlPanel sensorData={sensorData} darkMode={darkMode}/>
      );
    }

    if (activeNav === 'history') {
      return (
        <History darkMode={darkMode} sensorData={sensorData}/>
      );
    }

    if (activeNav === 'weather') {
      return (
        <Weather darkMode={darkMode}/>
      );
    }
  };

  return (
    <div className={`${darkMode ? 'dark-theme' : 'light-theme'} min-h-screen dark:bg-slate-900 dark:text-slate-50 bg-gray-50 transition-colors`}> 
      <Header
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        sensorData={sensorData}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogoutRequest={() => setShowLogoutConfirm(true)}
      />
      <Navbar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        mobileMenuOpen={mobileMenuOpen}
        isDarkMode={darkMode}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AlertNotifications alerts={alerts} darkMode={darkMode} onClose={() => setAlerts([])} />
        {renderContent()}
      </main>

      <ExitWindow
        open={showLogoutConfirm}
        darkMode={darkMode}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          localStorage.removeItem('smarthome_user');
          localStorage.removeItem('loggedIn');
          setShowLogoutConfirm(false);
          setIsLoggedIn(false);
        }}
      />
    </div>
  );
}

export default App;
