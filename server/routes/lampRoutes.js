import express from 'express';
import Sensor from '../models/Sensor.js';

const router = express.Router();

// Variable to store lamp status (in real app, this would be in database)
let lampStatus = false;

// POST toggle lamp
router.post('/toggle', async (req, res) => {
  try {
    const { currentStatus } = req.body;
    
    // Toggle status
    const newStatus = !currentStatus;
    lampStatus = newStatus; // Update local status
    
    console.log(`Toggling lamp from ${currentStatus} to ${newStatus}`);
    
    // Emit update ke semua client via Socket.IO
    const io = req.io; // Access io from middleware
    if (io) {
      // Emit lamp update
      io.emit('lamp_update', { 
        lampStatus: newStatus,
        timestamp: new Date().toISOString()
      });
      
      // Emit sebagai sensor update juga
      io.emit('sensor_update', { 
        lampStatus: newStatus,
        updatedAt: new Date()
      });
    }
    
    // Simulasi command ke hardware (Arduino/ESP32)
    // await sendCommandToHardware('LAMP_TOGGLE', newStatus);
    
    res.json({ 
      success: true, 
      message: `Lamp turned ${newStatus ? 'ON' : 'OFF'}`,
      status: newStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error toggling lamp:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to toggle lamp',
      message: error.message 
    });
  }
});

// GET current lamp status
router.get('/status', async (req, res) => {
  try {
    // Return current lamp status
    res.json({
      success: true,
      lampStatus: lampStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting lamp status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get lamp status',
      message: error.message
    });
  }
});

export default router;