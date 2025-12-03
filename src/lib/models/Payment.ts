import mongoose, { Document, Model } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  providerReference: string;
  ownerPortfolio: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  amount: Number,
  currency: String,
  status: { type: String, enum: ['pending', 'success', 'failed'] },
  providerReference: String,
  ownerPortfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
  createdAt: { type: Date, default: Date.now },
});

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;