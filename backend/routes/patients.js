import express from "express";
import Patient from "../models/patient.js";

const router = express.Router();

// 🩺 GET all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 GET a single patient by phone number
router.get("/phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const patient = await Patient.findOne({ phone: phone.trim() });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error("Error fetching patient by phone:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔄 UPDATE a patient by MongoDB _id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, phone } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { name, age, phone },
      { new: true } // return updated document
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ➕ POST create new patient
router.post("/", async (req, res) => {
  try {
    const { name, phone, age, gender, address, guardianName, guardianContact } = req.body;

    if (!phone || phone.trim().length !== 11) {
      return res.status(400).json({ message: "Phone number must be 11 digits" });
    }

    // Check if patient with same phone already exists
    const existing = await Patient.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ message: "Patient with this contact already exists." });
    }

    const patient = new Patient({
      name,
      phone: phone.trim(),
      age,
      gender,
      address,
      guardianName: guardianName || "",
      guardianContact: guardianContact || "",
    });

    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
