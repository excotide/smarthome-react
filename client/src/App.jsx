import { useState, useEffect } from 'react';
import { Lightbulb, Home, Thermometer, Droplets, Flame, Activity, AlertTriangle, Wifi, Power, Menu, X, BarChart3, Settings, Clock, Wind, Sun, Moon } from 'lucide-react';
import './App.css';

// pages & components
import StatusCard from './assets/components/StatusCard';
import Navbar from './assets/components/Navbar';
import Header from './assets/components/Header';
import ControlPanel from './assets/components/ControlPanel';
import SettingsPanel from './assets/components/SettingPanel';
import History from './assets/components/History';
import Alert from './assets/components/Alert';
import AlertNotifications from './assets/components/AlertNotifications';
import Weather from './assets/pages/Weather';

// hooks
import useDarkMode from './assets/hooks/useDarkMode';
import useSensorData from './assets/hooks/useSensorData';
import useAlerts from './assets/hooks/useAlerts';

function App() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [sensorData, setSensorData] = useSensorData();
  const alerts = useAlerts(sensorData);

  const [activeNav, setActiveNav] = useState('sensor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLamp = () => {
    setSensorData(prev => ({
      ...prev,
      lampStatus: !prev.lampStatus
    }));
  };

  const renderContent = () => {
    if (activeNav === 'sensor') {
      return (
        <>
          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatusCard
              title="Flame"
              value={`${sensorData.fireDetected ? 'DETECTED' : 'CLEAR'}`}
              icon={Flame}
              colorClass="red"
              isDark={darkMode}
            />
            <StatusCard
              title="Gas"
              value={`${sensorData.gasDetected ? 'DETECTED' : 'CLEAR'}`}
              icon={Wind}
              colorClass="blue"
              isDark={darkMode}
            />
            <StatusCard
              title="Tingkat Cahaya"
              value={`${sensorData.lightLevel.toFixed(0)}%`}
              icon={Activity}
              status={sensorData.lightLevel < 30 ? 'LOW' : 'NORMAL'}
              colorClass="yellow"
              isDark={darkMode}
            />
            <StatusCard
              title="Status Lampu"
              value="Lampu Utama"
              icon={Lightbulb}
              status={sensorData.lampStatus ? 'ON' : 'OFF'}
              colorClass={sensorData.lampStatus ? 'green' : 'gray'}
              isDark={darkMode}
            />
          </div>

          {/* Alert System */}
          <Alert sensorData={sensorData} darkMode={darkMode} />
        </>
      );
    }

    if (activeNav === 'control') {
      return (
        <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ControlPanel sensorData={sensorData} toggleLamp={toggleLamp} darkMode={darkMode}/>
          <SettingsPanel darkMode={darkMode}/>
        </div>
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
    <div className={`app ${darkMode ? 'dark-theme' : 'light-theme'} dark:bg-slate-900 dark:text-slate-50 bg-gray-50 min-h-screen transition-all`}>
      {/* Header */}
      <Header
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        sensorData={sensorData}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Navbar */}
      <Navbar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        mobileMenuOpen={mobileMenuOpen}
        isDarkMode={darkMode}
      />

      <div className="main-container max-w-7xl mx-auto px-4 py-8">
        {/* Alert Notifications */}
        <AlertNotifications alerts={alerts} darkMode={darkMode} />

        {/* Dynamic Content Based on Active Nav */}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;