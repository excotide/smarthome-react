import { useState, useEffect } from 'react';

// pages & components
import Navbar from './assets/components/Navbar';
import Header from './assets/components/Header';
import ControlPanel from './assets/pages/ControlPanel';
import History from './assets/pages/History';
import Alert from './assets/components/Alert';
import AlertNotifications from './assets/components/AlertNotifications';
import Weather from './assets/pages/Weather';

// pages
import Sensor from './assets/pages/Sensor';

// hooks
import useDarkMode from './assets/hooks/useDarkMode';
import useSensorData from './assets/hooks/useSensorData';
import useAlerts from './assets/hooks/useAlerts';

function App() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const sensorData = useSensorData();
  const alerts = useAlerts(sensorData);

  const [activeNav, setActiveNav] = useState('sensor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ⭐ STATE LOGIN
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ⭐ CEK LOGIN STATUS
  useEffect(() => {
    const user = localStorage.getItem('smarthome_user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  // ⭐ JIKA BELUM LOGIN, TAMPILKAN HALAMAN LOGIN
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
    <>
      {/* Header */}
      {/* <Header
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        sensorData={sensorData}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      /> */}

      {/* Navbar */}
      {/* <Navbar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        mobileMenuOpen={mobileMenuOpen}
        isDarkMode={darkMode}
      /> */}

      <div className="main-container max-w-7xl mx-auto px-4 py-8">
        {/* Alert Notifications */}
        <AlertNotifications alerts={alerts} darkMode={darkMode} />
        {/* {renderContent()} */}
      </div>
    </>
  );
}

export default App;
