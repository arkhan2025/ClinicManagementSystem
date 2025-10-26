// backend/routes/doctor.js
import express from "express";
import Token from "../models/Token.js";
import Patient from "../models/patients.js";
import Prescription from "../models/Prescription.js";

const router = express.Router();

// Fetch all waiting patients (tokens)
router.get("/tokens", async (req, res) => {
  try {
    const tokens = await Token.find({ status: "waiting" }).populate("patient");
    res.json(tokens);
  } catch (error) {
    console.error("Error fetching tokens:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Doctor adds a prescription
router.post("/prescribe", async (req, res) => {
  try {
    const { patientId, meds, notes, tokenId } = req.body;
    if (!patientId || !meds) return res.status(400).json({ message: "Missing required fields" });

    const prescription = await Prescription.create({ patient: patientId, meds, notes });

    // Update patient history
    await Patient.findByIdAndUpdate(patientId, {
      $push: { history: { date: new Date(), notes, prescription: prescription._id } },
    });

    // Mark token as seen
    if (tokenId) await Token.findByIdAndUpdate(tokenId, { status: "seen" });

    console.log(`🩺 Prescription added for patient ${patientId}`);
    res.json({ success: true, prescription });
  } catch (error) {
    console.error("Error adding prescription:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
