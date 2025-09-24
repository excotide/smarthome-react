# Smart Home React Project

Sistem monitoring dan kontrol smart home berbasis React dengan Node.js backend dan Socket.IO untuk komunikasi real-time dengan sensor IoT.

## 🏗️ Struktur Proyek

```
smarthome-react/
├── client/                 # Frontend React + Vite
├── server/                 # Backend Node.js + Express + Socket.IO
├── smarthome/             # Kode Arduino/ESP32
└── README.md
```

## 📋 Prerequisites

Pastikan sistem Anda memiliki:
- [Node.js](https://nodejs.org/) versi 16 atau lebih tinggi
- [MongoDB](https://www.mongodb.com/try/download/community) (untuk penyimpanan data sensor)
- [Arduino IDE](https://www.arduino.cc/en/software) atau [PlatformIO](https://platformio.org/) (untuk ESP32/Arduino)

## 🚀 Instalasi dan Setup

### 1. Clone Repository

```bash
git clone https://github.com/excotide/smarthome-react.git
cd smarthome-react
```

### 2. Setup Backend (Server)

```bash
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Start MongoDB (pastikan MongoDB sudah terinstall)
# Windows: mongod --dbpath="C:\data\db"
# macOS/Linux: sudo systemctl start mongod

# Jalankan server dalam mode development
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 3. Setup Frontend (Client)

```bash
# Buka terminal baru, masuk ke folder client
cd client

# Install dependencies
npm install

# Jalankan client dalam mode development
npm run dev
```

Client akan berjalan di `http://localhost:5173`

### 4. Setup Arduino/ESP32 (Opsional)

1. Buka file `smarthome/smarthome.ino` di Arduino IDE
2. Install library yang diperlukan:
   - WiFi (ESP32)
   - HTTPClient
   - ArduinoJson
   - ESPAsyncWebServer (jika menggunakan)
3. Sesuaikan konfigurasi WiFi dan IP server di kode
4. Upload ke board ESP32/Arduino

## 🔧 Konfigurasi

### Environment Variables

#### Client (.env)
Buat file `.env` di folder `client/`:
```env
VITE_API_BASE=http://localhost:3000
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

#### Server (.env) 
Buat file `.env` di folder `server/`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/smart_home
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### MongoDB Setup

1. Install dan jalankan MongoDB
2. Database akan otomatis dibuat dengan nama `smart_home`
3. Collection `sensors` akan dibuat otomatis saat ada data pertama

## 🌐 Fitur Utama

- **Real-time Monitoring**: Data sensor ditampilkan secara real-time menggunakan Socket.IO
- **Dark/Light Mode**: Toggle antara tema gelap dan terang
- **Weather Forecast**: Integrasi dengan OpenWeather API
- **Responsive Design**: Tampilan responsif untuk desktop dan mobile
- **Control Panel**: Kontrol perangkat IoT dari dashboard
- **History**: Riwayat data sensor tersimpan di database

## 📱 Penggunaan

1. Akses `http://localhost:5173` di browser
2. Dashboard akan menampilkan data sensor real-time
3. Gunakan navigation bar untuk berpindah antar halaman:
   - **Sensor**: Monitoring data sensor
   - **Control**: Kontrol perangkat
   - **History**: Riwayat data
   - **Weather**: Prakiraan cuaca

## 🔧 Development

### Menjalankan dalam Mode Development

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend  
cd client
npm run dev
```

### Build untuk Production

```bash
# Build client
cd client
npm run build

# Build server (tidak perlu build, langsung jalankan)
cd server
npm start
```

## 🐛 Troubleshooting

### Socket.IO Connection Error
Jika muncul error koneksi Socket.IO:
1. Pastikan server berjalan di port 3000
2. Periksa konfigurasi CORS di server
3. Pastikan tidak ada firewall yang memblokir koneksi

### MongoDB Connection Error
1. Pastikan MongoDB service berjalan
2. Periksa connection string di konfigurasi
3. Pastikan port 27017 tidak digunakan aplikasi lain

### Arduino/ESP32 Connection
1. Pastikan ESP32 terhubung ke WiFi yang sama dengan komputer
2. Periksa IP address server di kode Arduino
3. Gunakan mDNS untuk auto-discovery (opsional)

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 Lisensi

Project ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail.

## 👨‍💻 Author

- **excotide** - [GitHub](https://github.com/excotide)
