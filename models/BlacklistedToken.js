// models/BlacklistedToken.js
import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);