import express from 'express';
import History from '../models/History.js';

const router = express.Router();

// GET /api/history - Ambil history dengan pagination
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const history = await History.find()
      .sort({ 
        timestamp: -1, 
        createdAt: -1, 
        _id: -1 // ObjectId sebagai tiebreaker untuk precision maksimal
      }) 
      .limit(parseInt(limit))
      .skip(skip);

    const total = await History.countDocuments();
    
    res.json({
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/history - Simpan history baru
router.post('/', async (req, res) => {
  try {
    const { type, message, icon, sensorData } = req.body;
    
    const history = new History({
      type,
      message,
      icon,
      sensorData,
      timestamp: new Date() // Eksplisit set dengan millisecond precision
    });

    await history.save();
    
    console.log(`History saved: ${history.message} at ${history.timestamp.toISOString()} (${history.timestamp.getTime()}ms) - ID: ${history._id}`);
    
    // Broadcast ke semua client via Socket.IO
    req.io?.emit('history_update', history);
    
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/history/old - Hapus history lama (lebih dari 30 hari)
router.delete('/old', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await History.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });

    res.json({ deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;