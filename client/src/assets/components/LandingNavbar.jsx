import { useState } from "react"

const LandingNavbar = () => {
    const [open, setOpen] = useState(false)

    return (
    <>
      <div className={`${open ? 'top-0' : '-top-500' } absolute z-40 bg-zinc-200/50 backdrop-blur-2xl w-full left-0 h-screen transition-all duration-600`}>
        <ul className="flex flex-col items-center mt-24 gap-5">
          <span className="text-zinc-800 text-5xl font-bold"></span>
          <li><a href="#home" onClick={() => setOpen(false)} className="text-zinc-800 text-4xl font-bold">Home</a></li>
          <li><a href="#about" onClick={() => setOpen(false)} className="text-zinc-800 text-4xl font-bold">Sistem</a></li>
          <li><a href="#project" onClick={() => setOpen(false)} className="text-zinc-800 text-4xl font-bold">Fitur</a></li>
          <li><a href="#contact" onClick={() => setOpen(false)} className="text-zinc-800 text-4xl font-bold">Bantuan</a></li>
          <li className="mt-4">
            <button
              onClick={() => {
                // Simulasi login sederhana: set flag dan kirim event
                localStorage.setItem('loggedIn','true')
                window.dispatchEvent(new Event('auth:login'))
                setOpen(false)
              }}
              className="px-5 py-2 rounded-full border border-zinc-800 text-zinc-800 hover:bg-zinc-800 hover:text-white transition"
            >Login</button>
          </li>
        </ul>
      </div>
      <nav className={`${open ? 'bg-zinc-800/80' : 'bg-zinc-200/10' } navbar py-5 fixed top-0 backdrop-blur-md left-0 w-full z-50`}>
        <div className="flex items-center justify-between mx-12 relative">
          <span className="font-bold text-3xl">Smart Home</span>
          <div className="flex items-center gap-4">
          <button
            onClick={() => {
              localStorage.setItem('loggedIn','true')
              window.dispatchEvent(new Event('auth:login'))
            }}
            className="hidden md:inline-block px-4 py-2 rounded-full border border-zinc-100/70 text-zinc-100 hover:bg-zinc-100/10 transition"
          >Login</button>
          <button onClick={() => setOpen(!open)} className="flex flex-col gap-2 z-50 relative">
          <span className="bg-zinc-100 w-8 h-1.5 rounded-2xl block"></span>
          <span className="bg-zinc-100 w-8 h-1.5 rounded-2xl block"></span>
          </button>
          </div>
        </div>
      </nav>
    </>
	)
}

export default LandingNavbar