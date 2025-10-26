import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientPhone: { type: String, required: true }, // store patient phone
  meds: [
    {
      name: String,
      dose: String,
      duration: String,
      notes: String,
      quantity: Number,
      beforeMeal: Boolean,
      afterMeal: Boolean,
      morning: Boolean,
      noon: Boolean,
      night: Boolean,
    },
  ],
  notes: String,
  discount: { type: Number, default: 0 }, // doctor-provided discount
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Prescription", PrescriptionSchema);
