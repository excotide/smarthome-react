const Footer = () => {
  return (
  <div className="footer mt-8 bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Perancangan Sistem IoT Smart Home</h3>
    <p className="text-gray-500 dark:text-slate-300 mb-4">
      Sistem monitoring dengan lampu otomatis berdasarkan tingkat cahaya dan sensor gerak, 
      dilengkapi dengan rain fire alert untuk keamanan rumah.
    </p>
    <div className="footer-features flex justify-center gap-8 text-sm text-gray-500 dark:text-slate-300 flex-wrap">
      <span>🏠 Smart Home Control</span>
      <span>💡 Auto Lighting System</span>
      <span>🌧️ Rain Detection</span>
      <span>🔥 Fire Alert System</span>
    </div>
</div>
  )
}

export default Footer