import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './assets/pages/LandingPage.jsx'

// Root component: tampilkan LandingPage dulu, setelah login tampilkan App
function Root() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // Cek status login tersimpan
    if (localStorage.getItem('loggedIn') === 'true') {
      setLoggedIn(true)
    }
    // Dengarkan event custom ketika login sukses
    const onLogin = () => setLoggedIn(true)
    window.addEventListener('auth:login', onLogin)
    return () => window.removeEventListener('auth:login', onLogin)
  }, [])

  // Register service worker untuk push
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW register gagal:', err)
      })
    }
  }, [])

  return loggedIn ? <App /> : <LandingPage />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
