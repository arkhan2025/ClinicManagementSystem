import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../../api/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", formData);
      const user = res.data.user;

      // Store user in context
      login(user);

      // Role-based navigation
      if (user.role === "doctor") {
        navigate("/dashboard");
      } else if (user.role === "receptionist") {
        navigate("/dashboard"); // receptionist also goes to dashboard but sees different UI
      } else {
        alert("Unknown role!");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid email or password!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Clinic Management</h1>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
