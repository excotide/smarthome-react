import mongoose from 'mongoose';

// Schema untuk menyimpan riwayat perubahan sensor / event sistem
const historySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['info', 'warning', 'danger', 'success'],
    default: 'info'
  },
  message: { type: String, required: true },
  icon: { type: String, default: 'info' },
  sensorData: {
    lightLevel: { type: Number },
    gasDetected: { type: Boolean },
    rainDetected: { type: Boolean },
    fireDetected: { type: Boolean },
    lampStatus: { type: Boolean },
    motionDetected: { type: Boolean },
    temperature: { type: Number },
    humidity: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model('History', historySchema);
