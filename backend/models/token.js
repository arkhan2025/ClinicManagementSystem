import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  tokenNumber: { type: Number, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientPhone: { type: String, required: true }, // store phone number
  status: { type: String, enum: ["waiting", "seen", "completed", "absent"], default: "waiting" },
  issue: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Token", TokenSchema);
