import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    flame: Number,
    mq2: Number,        // nilai analog MQ2 atau raw dari sensor
    gas_status: Number, // 0 = gas terdeteksi (bahaya), 1 = aman
    rain: Number,
    lux: Number
  },
  { timestamps: true }
);

export default mongoose.model("Sensor", sensorSchema);
