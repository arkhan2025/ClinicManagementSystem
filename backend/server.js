// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/auth.js";
import patientsRoute from "./routes/patients.js";
import tokenRoutes from "./routes/tokens.js"; 
import prescriptionRoutes from "./routes/prescriptions.js";
import billingRoutes from "./routes/billings.js";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Routes
app.use("/api/auth", userRoutes);
app.use("/api/patients", patientsRoute);
app.use("/api/token", tokenRoutes); 
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/billing", billingRoutes);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
