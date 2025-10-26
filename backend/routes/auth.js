import express from "express";
import bcrypt from "bcryptjs";
import Doctor from "../models/doctor.js";
import Receptionist from "../models/receptionist.js";

const router = express.Router();

// ✅ POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 0️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 1️⃣ Try to find Doctor first
    let user = await Doctor.findOne({ email });
    let role = "doctor";

    // 2️⃣ If not found, check Receptionist
    if (!user) {
      user = await Receptionist.findOne({ email });
      role = "receptionist";
    }

    // 3️⃣ If user not found
    if (!user) {
      console.log("❌ No user found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`✅ User found in ${role} collection:`, user.email);

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 5️⃣ Return user info on success
    console.log("✅ Password matched successfully!");
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || role,
      },
    });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
