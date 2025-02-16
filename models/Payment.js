// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  method: {
    type: String,
    enum: ['OM', 'WAVE'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['payé non livré', 'payé livré'],
    default: 'payé non livré'
  }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);