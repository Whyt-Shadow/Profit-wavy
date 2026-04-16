import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String },
  displayName: { type: String },
  photoURL: { type: String },
  balance: { type: Number, default: 5 },
  totalInvested: { type: Number, default: 0 },
  totalReturns: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String }, // Stores the referralCode of the referrer
  paymentMethods: [{
    type: { type: String, enum: ['momo', 'card'] },
    details: { type: String },
    provider: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
}, { bufferCommands: false });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['investment', 'return', 'deposit', 'withdrawal', 'bonus', 'referral'], required: true },
  amount: { type: Number, required: true },
  planName: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  timestamp: { type: Date, default: Date.now },
}, { bufferCommands: false });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
