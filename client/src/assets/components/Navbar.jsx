import { BarChart3, Settings, Clock } from 'lucide-react';

const Navbar = ({ activeNav, setActiveNav, mobileMenuOpen, isDarkMode }) => {
  return (
    <nav className={`navbar ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow sticky top-0 z-[50]`}>
      <div className={`nav-menu ${mobileMenuOpen ? 'nav-menu-open' : ''} flex max-w-7xl mx-auto gap-0`}>
        <button
          className={`flex items-center gap-2 py-4 px-6 font-medium transition border-b-4 ${
            activeNav === 'sensor'
              ? `${isDarkMode ? 'text-blue-400 border-blue-400 bg-slate-700' : 'text-indigo-600 border-indigo-600 bg-slate-50'}`
              : `${isDarkMode ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-700 border-transparent' : 'text-gray-500 hover:text-indigo-600 hover:bg-slate-50 border-transparent'}`
          }`}
          onClick={() => setActiveNav('sensor')}
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </button>
        <button
          className={`flex items-center gap-2 py-4 px-6 font-medium transition border-b-4 ${
            activeNav === 'control'
              ? `${isDarkMode ? 'text-blue-400 border-blue-400 bg-slate-700' : 'text-indigo-600 border-indigo-600 bg-slate-50'}`
              : `${isDarkMode ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-700 border-transparent' : 'text-gray-500 hover:text-indigo-600 hover:bg-slate-50 border-transparent'}`
          }`}
          onClick={() => setActiveNav('control')}
        >
          <Settings size={20} />
          <span>Control Panel</span>
        </button>
        <button
          className={`flex items-center gap-2 py-4 px-6 font-medium transition border-b-4 ${
            activeNav === 'history'
              ? `${isDarkMode ? 'text-blue-400 border-blue-400 bg-slate-700' : 'text-indigo-600 border-indigo-600 bg-slate-50'}`
              : `${isDarkMode ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-700 border-transparent' : 'text-gray-500 hover:text-indigo-600 hover:bg-slate-50 border-transparent'}`
          }`}
          onClick={() => setActiveNav('history')}
        >
          <Clock size={20} />
          <span>History</span>
        </button>
        <button
          className={`flex items-center gap-2 py-4 px-6 font-medium transition border-b-4 ${
            activeNav === 'weather'
              ? `${isDarkMode ? 'text-blue-400 border-blue-400 bg-slate-700' : 'text-indigo-600 border-indigo-600 bg-slate-50'}`
              : `${isDarkMode ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-700 border-transparent' : 'text-gray-500 hover:text-indigo-600 hover:bg-slate-50 border-transparent'}`
          }`}
          onClick={() => setActiveNav('weather')}
        >
          <Clock size={20} />
          <span>Weather Forecast</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;