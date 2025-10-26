// backend/routes/receptionist.js
import express from "express";
import Patient from "../models/Patient.js";
import Token from "../models/token.js";
import Billing from "../models/Billing.js";

const router = express.Router();

// Create a new patient and auto-generate a token
router.post("/create-patient", async (req, res) => {
  try {
    const { name, phone, age, gender, address } = req.body;
    if (!name) return res.status(400).json({ message: "Patient name is required" });

    const patient = await Patient.create({ name, phone, age, gender, address });

    // Generate a new token number
    const lastToken = await Token.findOne().sort({ tokenNumber: -1 });
    const newTokenNumber = (lastToken?.tokenNumber || 0) + 1;

    const token = await Token.create({ tokenNumber: newTokenNumber, patient: patient._id });

    console.log(`🧾 New Token #${newTokenNumber} issued for ${name}`);
    res.json({ success: true, patient, token });
  } catch (error) {
    console.error("Error creating patient:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create billing info
router.post("/create-bill", async (req, res) => {
  try {
    const { patientId, tokenId, amount } = req.body;
    if (!patientId || !amount) return res.status(400).json({ message: "Missing fields" });

    const bill = await Billing.create({ patient: patientId, token: tokenId, amount });
    console.log(`💰 Bill created for patient ${patientId} (Amount: ${amount})`);

    res.json({ success: true, bill });
  } catch (error) {
    console.error("Error creating bill:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
