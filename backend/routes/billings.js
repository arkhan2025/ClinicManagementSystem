import express from "express";
import Billing from "../models/billing.js";

const router = express.Router();

// POST /api/billing
router.post("/", async (req, res) => {
  try {
    const billing = new Billing(req.body);
    await billing.save();
    res.status(201).json({ message: "Billing saved", billing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving billing" });
  }
});

export default router;
