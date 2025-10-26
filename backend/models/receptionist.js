import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const receptionistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "receptionist" },
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
receptionistSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Receptionist = mongoose.model("Receptionist", receptionistSchema);

export default Receptionist;
