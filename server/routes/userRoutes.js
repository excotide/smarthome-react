import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Tanpa JWT: login hanya mengembalikan info user dasar

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email: String(email).toLowerCase(), passwordHash });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Gagal registrasi' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      message: 'Login berhasil (tanpa JWT)'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Gagal login' });
  }
});

// GET /api/users (dev helper): daftar user tanpa passwordHash
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '_id name email createdAt pushSettings')
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ message: 'Gagal mengambil data users' });
  }
});

// GET /api/users/:id/push-settings
router.get('/:id/push-settings', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('pushSettings');
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    return res.json(user.pushSettings || {});
  } catch (err) {
    console.error('Get push settings error:', err);
    return res.status(500).json({ message: 'Gagal mengambil push settings' });
  }
});

// PUT /api/users/:id/push-settings  { gas, flame, rain }
router.put('/:id/push-settings', async (req, res) => {
  try {
    const { gas, flame, rain } = req.body || {};
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    user.pushSettings = {
      gas: typeof gas === 'boolean' ? gas : (user.pushSettings?.gas ?? true),
      flame: typeof flame === 'boolean' ? flame : (user.pushSettings?.flame ?? true),
      rain: typeof rain === 'boolean' ? rain : (user.pushSettings?.rain ?? false)
    };
    await user.save();
    return res.json({ message: 'Push settings diperbarui', pushSettings: user.pushSettings });
  } catch (err) {
    console.error('Update push settings error:', err);
    return res.status(500).json({ message: 'Gagal memperbarui push settings' });
  }
});

export default router;
