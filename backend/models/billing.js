import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientPhone: { type: String, required: true }, // store phone
  token: { type: mongoose.Schema.Types.ObjectId, ref: "Token" },
  amount: { type: Number, required: true }, // actual amount after discount
  paidAmount: { type: Number, required: true }, // amount provided by patient
  returnAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // doctor discount
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Billing", BillingSchema);
