import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: () => new Date() // Menggunakan new Date() untuk millisecond precision
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'danger', 'success'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  sensorData: {
    temperature: Number,
    humidity: Number,
    lightLevel: Number,
    gasDetected: Boolean,
    rainDetected: Boolean,
    fireDetected: Boolean,
    motionDetected: Boolean,
    lampStatus: Boolean
  }
}, {
  timestamps: true
});

// Index untuk query berdasarkan timestamp (descending untuk sort terbaru dulu)
historySchema.index({ timestamp: -1 });
historySchema.index({ createdAt: -1 });
// Compound index untuk sorting optimal
historySchema.index({ timestamp: -1, createdAt: -1 });

export default mongoose.model('History', historySchema);