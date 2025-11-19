import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    pushSettings: {
      gas: { type: Boolean, default: true },
      flame: { type: Boolean, default: true },
      rain: { type: Boolean, default: false },
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
