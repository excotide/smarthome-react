import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    flame: Number,
    mq2: Number,
    rain: Number,
    lux: Number
  },
  { timestamps: true }
);

export default mongoose.model("Sensor", sensorSchema);
