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
    const users = await User.find({}, '_id name email createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ message: 'Gagal mengambil data users' });
  }
});

export default router;
