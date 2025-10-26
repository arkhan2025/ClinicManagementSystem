import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, // 🔹 required & unique
    age: Number,
    gender: String,
    address: String,
    guardianName: String,
    guardianContact: String,
    history: [
      {
        date: { type: Date, default: Date.now },
        notes: String,
        prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
