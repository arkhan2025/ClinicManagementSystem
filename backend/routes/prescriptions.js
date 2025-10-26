import express from "express";
import Prescription from "../models/prescription.js";
import Token from "../models/token.js";

const router = express.Router();

// 🔹 POST /api/prescriptions — create a prescription for a token
router.post("/", async (req, res) => {
  try {
    const { tokenId, meds, notes, discount } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: "Token ID is required" });
    }

    // Find token and populate patient
    const token = await Token.findById(tokenId).populate("patient");
    if (!token) return res.status(404).json({ message: "Token not found" });

    // Create prescription
    const prescription = new Prescription({
      patient: token.patient._id,
      patientPhone: token.patient.phone, // store phone
      meds: meds || [],
      notes: notes || "",
      discount: discount || 0, // store doctor-provided discount
    });

    await prescription.save();

    // Mark token as seen if not already
    token.status = "seen";
    await token.save();

    res.status(201).json({ message: "Prescription created", prescription });
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ message: "Server error while creating prescription" });
  }
});

// 🔹 GET /api/prescriptions/:tokenId — get prescription by token ID
router.get("/:tokenId", async (req, res) => {
  try {
    const token = await Token.findById(req.params.tokenId).populate("patient");
    if (!token) return res.status(404).json({ message: "Token not found" });

    const prescription = await Prescription.findOne({ patient: token.patient._id }).sort({ createdAt: -1 });
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    res.status(200).json({ token, prescription });
  } catch (err) {
    console.error("Error fetching prescription:", err);
    res.status(500).json({ message: "Server error while fetching prescription" });
  }
});

// 🔹 GET /api/prescriptions — list all prescriptions (optional)
router.get("/", async (req, res) => {
  try {
    const prescriptions = await Prescription.find().populate("patient").sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ message: "Server error while fetching prescriptions" });
  }
});

export default router;
