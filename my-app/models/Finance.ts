// File: models/Finance.ts
import mongoose, { Schema, model, models } from 'mongoose';

const TransactionSchema = new Schema({
  userId: {
    type: String, 
    required: true,
    index: true, 
  },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
}, { timestamps: true });

const FinanceTransaction = models.FinanceTransaction || model('FinanceTransaction', TransactionSchema);

export default FinanceTransaction;