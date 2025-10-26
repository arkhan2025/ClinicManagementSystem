import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Doctor from "./models/doctor.js";
import Receptionist from "./models/receptionist.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing records
    await Doctor.deleteMany();
    await Receptionist.deleteMany();

    const hashedPassword = await bcrypt.hash("zayed", 10);

    // Seed doctors
    const doctors = [
      {
        name: "Dr. Ashfaqur Rahman Khan",
        email: "arkhan@gmail.com",
        password: hashedPassword,
        role: "doctor",
      },
    ];

    // Seed receptionists
    const receptionists = [
      {
        name: "Ar Khan",
        email: "ar.khan@gmail.com",
        password: hashedPassword,
        role: "receptionist",
      },
    ];

    await Doctor.insertMany(doctors);
    await Receptionist.insertMany(receptionists);

    console.log("🌱 Seeded doctors and receptionists successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
};

seedUsers();
