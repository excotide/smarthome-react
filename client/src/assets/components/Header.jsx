import { Home, Sun, X, Moon, Menu,  Wifi } from 'lucide-react'

const Header = ({ toggleDarkMode, darkMode, sensorData, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <header className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'} shadow-sm border-b relative z-[100]`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="header-content flex justify-between items-center py-4">
          <div className="header-title flex items-center gap-3">
            <Home size={32} className="icon-blue hidden md:block" />
            <div>
              <h1 className={`${darkMode ? 'text-gray-50' : 'text-slate-900'} text-xl font-bold`}>Smart Home</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-slate-500'} text-sm hidden md:block`}>Lampu Otomatis & Rain Fire Alert</p>
            </div>
          </div>
          <div className="header-actions flex items-center gap-4">
            <button 
              className={`${darkMode ? 'text-slate-50 border-slate-600 hover:border-blue-400 hover:text-blue-400 transition' : 'border-gray-500 text-gray-500 hover:border-indigo-600 hover:text-indigo-600'} theme-toggle bg-transparent border-2 rounded-full w-10 h-10 flex items-center justify-center`}
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="connection-status flex items-center gap-2">
              <Wifi 
                size={20} 
                className={sensorData.connectionStatus ? 'icon-green' : 'icon-red'} 
              />
              <span className={`${darkMode ? 'text-slate-300' : 'text-gray-500'} text-sm hidden md:block`}>
                {sensorData.connectionStatus ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              className={`mobile-menu-toggle block md:hidden ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header