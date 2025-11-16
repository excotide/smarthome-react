import { useRef, useEffect } from 'react'
import Button from '../components/Button'
import LandingNavbar from '../components/LandingNavbar'
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa'

const LandingPage = () => {

  const scrollContainerRef = useRef(null)

  // Prevent body from scrolling to avoid double scrollbars
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Animate elements with .reveal-on-scroll across all sections
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal-on-scroll')
    if (!targets.length) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target
          const delay = el.getAttribute('data-delay') || '0s'
          el.style.animationDelay = delay
          el.classList.add('animate__animated', 'animate__fadeInUp')
          el.classList.remove('opacity-0')
          observer.unobserve(el)
        }
      })
    }, { threshold: 0.2 })
    targets.forEach(t => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  const scrollLeft = () => {
    scrollContainerRef.current.scrollBy({
      left: -300,
      behavior: 'smooth'
    })
  }

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({
      left: 300,
      behavior: 'smooth'
    })
  }

  // (framer-motion removed)

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll dark:bg-slate-900 dark:text-slate-50 bg-gray-50 font-poppins">
      <LandingNavbar />
      {/* home */}
      <section
        id="home"
        className="snap-start relative"
        style={{ backgroundImage: 'url(/bg-section-1.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        {/* Overlay gelap tipis agar teks lebih jelas */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="hero grid md:grid-cols-3 h-screen md:justify-between md:items-center relative z-10">
          <div
            className="hero-content order-2 md:mt-18 md:col-span-2 text-center md:text-left"
          >
            <span className="text-zinc-300/50 sm:text-1xl/tight md:text-3xl/tight animate__animated animate__fadeInDown">
              Smart Home
            </span>
            <h1 className="font-bold mt-3 md:mt-7 text-2xl md:text-5xl animate__animated animate__fadeInUp animate__delay-1s">
              SMART HOME DASHBOARD
            </h1>
            <p className="mt-3 md:mt-7 animate__animated animate__fadeInUp animate__delay-2s">
              Pantau sensor (Api, Gas, Hujan, Cahaya) secara realtime, kendalikan lampu dalam mode otomatis atau manual, dan lihat riwayat perubahan dengan tampilan yang konsisten dan nyaman.
            </p>
            <div className="items-center justify-center flex mt-7 animate__animated animate__fadeInUp animate__delay-3s">
              <Button name="Buka Dashboard" link="/" className="w-fit"/>
            </div>
          </div>
          <div
            className="flex text-center order-1 mt-18 md:mt-0 items-center justify-center"
          >
            <img
              src="https://picsum.photos/seed/smarthome/200/300"
              alt="ilustrasi-smart-home"
              className="rounded-3xl w-32 xl:w-1/2 shadow-xl"
            />
          </div>
        </div>
      </section>  
      {/* home */}

      {/* about */}
      <section
        id="about"
        className="snap-start relative"
        style={{ backgroundImage: 'url(/bg-section-2.png)', backgroundSize: '90%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        <div  className="about grid grid-cols-1 md:grid-cols-3 h-screen">
          <div className="col-span-2 order-2 md:order-1 md:mt-7 flex flex-col items-center md:items-end md:justify-center">
            <h2 className="text-2xl md:text-5xl font-bold text-right reveal-on-scroll opacity-0" data-delay="0s">Tentang Sistem</h2>
            <span className="text-zinc-300/50 text-center md:text-right sm:text-1xl/tight mt-7 md:text-3xl/tight reveal-on-scroll opacity-0" data-delay="0.15s">Smart Home berbasis IoT</span>
            <p className="mt-7 text-center md:text-right reveal-on-scroll opacity-0" data-delay="0.3s">
              Sistem ini dibangun dengan React (front‑end), Node.js + Socket.IO (server), MQTT (HiveMQ Cloud), serta perangkat ESP8266 dan sensor BH1750/MQ‑2/Rain/Flame. Fokus pada keandalan realtime, kontrol manual/otomatis, dan riwayat yang rapi.
            </p>
            <div className="mt-7 md:text-right reveal-on-scroll opacity-0" data-delay="0.45s">
              <Button name="Dokumentasi Singkat" link="#project" />
            </div>
          </div>
          <div className="order-1 md:order-2 flex items-center justify-center mt-14">
            <img src="https://picsum.photos/seed/iot/400/400" alt="ilustrasi-iot" className="rounded-3xl w-44 md:w-1/2 shadow-lg reveal-on-scroll opacity-0" data-delay="0.6s"/>
          </div>
        </div>
      </section>
      {/* about */}

      {/* project */}
      <section id="project" className="snap-start">
        <div className="project flex flex-col h-screen justify-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 reveal-on-scroll opacity-0" data-delay="0s">Fitur Utama</h2>
          
          {/* Navigation buttons - visible only on mobile */}
          <div className="flex justify-between items-center mb-4 md:hidden">
            <button 
              onClick={scrollLeft}
              className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full border border-zinc-600 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-zinc-400 text-sm">Geser atau pakai panah</span>
            
            <button 
              onClick={scrollRight}
              className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full border border-zinc-600 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto mx-1 snap-x snap-mandatory pb-4 scroll-smooth reveal-on-scroll opacity-0"
            data-delay="0.15s"
            style={{
              justifyContent: window.innerWidth >= 768 ? 'center' : 'flex-start',
              overflowX: window.innerWidth >= 768 ? 'visible' : 'auto'
            }}>
            <div
              className="flex h-fit flex-col items-center min-w-[250px] md:min-w-[280px] snap-center"
            >
              <img src="https://picsum.photos/seed/sensor/400/400" alt="monitoring-sensor" className="rounded-lg w-full max-w-[220px] shadow"/>
              <p className="text-center mt-3 px-3 text-sm max-w-[200px] leading-relaxed">
                Monitoring sensor realtime: Flame, MQ‑2 (gas/asap), Rain, dan tingkat cahaya (BH1750) dengan pembaruan langsung.
              </p>
              <Button name="Lihat Detail" link="#" />
            </div>
            <div
              className="flex h-fit flex-col items-center min-w-[250px] md:min-w-[280px] snap-center"
            >
              <img src="https://picsum.photos/seed/control/400/400" alt="kontrol-perangkat" className="rounded-lg w-full max-w-[220px] shadow"/>
              <p className="text-center mt-3 px-3 text-sm max-w-[200px] leading-relaxed">
                Kontrol perangkat: mode otomatis/manual untuk lampu, status tersinkron lewat MQTT & Socket.IO.
              </p>
              <Button name="Lihat Detail" link="#" />
            </div>
            <div
              className="flex h-fit flex-col items-center min-w-[250px] md:min-w-[280px] snap-center"
            >
              <img src="https://picsum.photos/seed/history/400/400" alt="riwayat-notifikasi" className="rounded-lg w-full max-w-[220px] shadow"/>
              <p className="text-center mt-3 px-3 text-sm max-w-[200px] leading-relaxed">
                Riwayat & notifikasi: hanya perubahan bermakna yang dicatat, tampilan konsisten dan anti-spam.
              </p>
              <Button name="Lihat Detail" link="#" />
            </div>
          </div>
        </div>
      </section>
      {/* project */}
      
      {/* contact */}
      <section id="contact">
        <div className="contact snap-start h-screen grid">
          <h2 className="text-center mt-28 md:mt-32 font-bold text-3xl md:text-5xl reveal-on-scroll opacity-0" data-delay="0s">Kontak & Bantuan</h2>
          
          {/* Mobile Navbar - Clean Dot Indicator Design */}
          <div className="md:hidden flex -mt-32 justify-center items-center space-x-8">
            <button 
              id="form-tab"
              className="flex flex-col items-center space-y-2 group"
              onClick={() => {
                document.getElementById('contact-form').classList.remove('hidden')
                const socialMediaDiv = document.getElementById('social-media');
                socialMediaDiv.classList.add('hidden');
                socialMediaDiv.classList.remove('flex', 'flex-col', 'justify-center');
                document.getElementById('form-tab').className = "flex flex-col items-center space-y-2 group"
                document.getElementById('social-tab').className = "flex flex-col items-center space-y-2 group opacity-50"
              }}
            >
              <span className="text-sm font-medium">Form</span>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </button>
            <button 
              id="social-tab"
              className="flex flex-col items-center space-y-2 group opacity-50"
              onClick={() => {
                document.getElementById('contact-form').classList.add('hidden')
                const socialMediaDiv = document.getElementById('social-media');
                socialMediaDiv.classList.remove('hidden');
                socialMediaDiv.classList.add('flex', 'flex-col', 'justify-center');
                document.getElementById('social-tab').className = "flex flex-col items-center space-y-2 group"
                document.getElementById('form-tab').className = "flex flex-col items-center space-y-2 group opacity-50"
              }}
            >
              <span className="text-sm font-medium">Sosial</span>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </button>
          </div>

          {/* Desktop: Side by side layout */}
          <form action="https://formsubmit.co/d8c13798ebeaf7817534f2b2030e2c3e" method="POST" className="hidden md:flex border-zinc-300 border-2 rounded-3xl lg:w-2/3 mx-auto w-full h-fit reveal-on-scroll opacity-0" data-delay="0.15s">
            <div className="p-7 w-1/2">
              <div>
                <label htmlFor="name" className="font-medium">Nama</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="masukkan nama anda"
                  className="w-full mt-2 border-2 border-zinc-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:zinc-300 focus:border-zinc-200 bg-zinc-800"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="example.email@anda.com"
                  className="w-full mt-2 border-2 border-zinc-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:zinc-300 focus:border-zinc-200 bg-zinc-800"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="pesan">Pesan</label>
                <textarea
                  name="pesan"
                  id="pesan"
                  rows="5"
                  placeholder="masukkan pesan anda disini"
                  className="w-full mt-2 border-2 border-zinc-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:zinc-300 focus:border-zinc-200 bg-zinc-800 h-24"
                  required
                ></textarea>
              </div>
              <Button as="submit" name="Kirim" className="mt-5"/>
            </div>
            <div className="p-7 w-1/2">
              <h3 className="text-center mb-4">Sosial Media</h3>
              <div className="flex flex-col text-center mx-auto space-y-3">
                <Button name="Github" link="#" icon={<FaGithub />} />
                <Button name="Instagram" link="#" icon={<FaInstagram />} />        
                <Button name="Linkedin" link="#" icon={<FaLinkedin />}/>      
              </div>
            </div>
          </form>

          {/* Mobile: Tabbed Content */}
          <div className="md:hidden reveal-on-scroll opacity-0" data-delay="0.15s">
            {/* Form Tab Content */}
            <form 
              id="contact-form"
              action="https://formsubmit.co/d8c13798ebeaf7817534f2b2030e2c3e" 
              method="POST" 
              className="border-zinc-300 border-2 rounded-3xl p-6 mx-auto w-full max-w-md h-96"
            >
              <div>
                <label htmlFor="mobile-name" className="font-medium"></label>
                <input
                  id="mobile-name"
                  type="text"
                  name="name"
                  placeholder="masukkan nama anda"
                  className="w-full mt-2 border-2 border-zinc-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:zinc-300 focus:border-zinc-200 bg-zinc-800"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="mobile-email"></label>
                <input
                  id="mobile-email"
                  type="email"
                  name="email"
                  placeholder="example.email@anda.com"
                  className="w-full mt-2 border-2 border-zinc-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:zinc-300 focus:border-zinc-200 bg-zinc-800"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="mobile-pesan"></label>
                <textarea
                  name="pesan"
                  id="mobile-pesan"
                  rows="3"
                  placeholder="masukkan pesan anda disini"
                  className="w-full mt-2 border-2 border-zinc-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:zinc-300 focus:border-zinc-200 bg-zinc-800"
                  required
                ></textarea>
              </div>
              <Button as="submit" name="Kirim" className="mt-5 w-full justify-center"/>
            </form>

            {/* Social Media Tab Content */}
            <div 
              id="social-media"
              className="hidden border-zinc-300 border-2 rounded-3xl p-6 mx-auto w-full max-w-md h-96 reveal-on-scroll opacity-0"
              data-delay="0.3s"
            >
              <h3 className="text-center mb-6 text-xl font-semibold">Sosial Media</h3>
              <div className="flex flex-col space-y-4">
                <Button name="Github" link="#" icon={<FaGithub />} className="w-full justify-center" />
                <Button name="Instagram" link="#" icon={<FaInstagram />} className="w-full justify-center" />        
                <Button name="Linkedin" link="#" icon={<FaLinkedin />} className="w-full justify-center" />      
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage;