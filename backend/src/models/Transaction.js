const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["Income", "Expense"], required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true }, // ✅ user-provided date
  meta: Object,
});

module.exports = mongoose.model("Transaction", TransactionSchema);
