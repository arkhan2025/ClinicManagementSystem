import express from "express";
import Token from "../models/token.js";
import Patient from "../models/patient.js";

const router = express.Router();

// POST /api/token — generate a new token for a patient
router.post("/", async (req, res) => {
  try {
    const { patientId, issue } = req.body;

    if (!patientId || !issue) {
      return res.status(400).json({ message: "Patient and issue are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const existingToken = await Token.findOne({ patient: patientId, status: "waiting" });
    if (existingToken) {
      return res.status(400).json({ message: "Token already exists" });
    }

    const lastToken = await Token.findOne().sort({ tokenNumber: -1 });
    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const newToken = new Token({
      tokenNumber: nextTokenNumber,
      patient: patientId,
      patientPhone: patient.phone.trim(),
      issue,
    });

    await newToken.save();
    res.status(201).json({ message: "Token generated", token: newToken });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ message: "Server error while generating token" });
  }
});

// GET /api/token — fetch all tokens or filter by patientPhone
router.get("/", async (req, res) => {
  try {
    const { patientPhone } = req.query;

    let tokens;
    if (patientPhone) {
      tokens = await Token.find({ patientPhone: patientPhone.trim() }).populate("patient");
    } else {
      tokens = await Token.find().populate("patient"); // fetch all tokens
    }

    res.status(200).json(tokens);
  } catch (err) {
    console.error("Error fetching tokens:", err);
    res.status(500).json({ message: "Server error fetching tokens" });
  }
});

// GET /api/token/:id — get a single token by ID
router.get("/:id", async (req, res) => {
  try {
    const token = await Token.findById(req.params.id).populate("patient");
    if (!token) return res.status(404).json({ message: "Token not found" });
    res.status(200).json(token);
  } catch (err) {
    console.error("Error fetching token by ID:", err);
    res.status(500).json({ message: "Server error fetching token" });
  }
});

// GET /api/token/phone/:phone — get the latest token by patient phone
router.get("/phone/:phone", async (req, res) => {
  try {
    const phone = req.params.phone.trim();
    const token = await Token.findOne({ patientPhone: phone })
      .sort({ createdAt: -1 })
      .populate("patient");

    if (!token) return res.status(404).json({ message: "Token not found" });

    res.status(200).json(token);
  } catch (err) {
    console.error("Error fetching token by phone:", err);
    res.status(500).json({ message: "Server error fetching token by phone" });
  }
});

// PUT /api/token — update token status using patientPhone + currentStatus
router.put("/", async (req, res) => {
  try {
    let { patientPhone, currentStatus, newStatus } = req.body;

    if (!patientPhone || !currentStatus || !newStatus) {
      return res.status(400).json({ message: "patientPhone, currentStatus and newStatus are required" });
    }

    patientPhone = patientPhone.trim();

    const token = await Token.findOne({ patientPhone, status: currentStatus });
    if (!token) {
      return res.status(404).json({ message: "Token not found for this phone with current status" });
    }

    token.status = newStatus;
    await token.save();

    res.status(200).json({ message: "Token status updated successfully", token });
  } catch (err) {
    console.error("Error updating token by phone:", err);
    res.status(500).json({ message: "Server error updating token" });
  }
});

export default router;
