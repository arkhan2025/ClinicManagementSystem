import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./patientForm.css";

const PopupMessage = ({ message, type, onClose, onConfirm, confirmText, cancelText }) => (
  <div className={`popup-message ${type}`}>
    <p>{message}</p>
    <div className="popup-buttons">
      {onConfirm ? (
        <>
          <button onClick={onConfirm}>{confirmText || "Yes"}</button>
          <button onClick={onClose}>{cancelText || "No"}</button>
        </>
      ) : (
        <button onClick={onClose}>OK</button>
      )}
    </div>
  </div>
);

const PatientForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    guardianName: "",
    guardianContact: "",
    address: "",
  });

  const [popup, setPopup] = useState({ message: "", type: "", onConfirm: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone) => /^\d{11}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopup({ message: "", type: "" });

    const age = parseInt(formData.age, 10);
    const isMinor = age < 18;

    // 🔹 Validate based on age
    if (isMinor) {
      // Minor: guardian info required, own contact optional
      if (!formData.guardianName || !formData.guardianContact) {
        return setPopup({
          message: "❌ Guardian name and contact are required for minors.",
          type: "error",
        });
      }
      if (!validatePhone(formData.guardianContact)) {
        return setPopup({
          message: "❌ Guardian contact must be exactly 11 digits.",
          type: "error",
        });
      }
    } else {
      // Adult: personal contact required
      if (!formData.contact) {
        return setPopup({
          message: "❌ Contact number is required for adults.",
          type: "error",
        });
      }
      if (!validatePhone(formData.contact)) {
        return setPopup({
          message: "❌ Contact number must be exactly 11 digits.",
          type: "error",
        });
      }
    }

    try {
      // 🔹 Prepare payload
      const payload = {
        name: formData.name,
        age,
        gender: formData.gender,
        address: formData.address,
        phone: isMinor ? formData.guardianContact.trim() : formData.contact.trim(),
        guardianName: isMinor ? formData.guardianName.trim() : formData.guardianName || "",
        guardianContact: isMinor ? formData.guardianContact.trim() : formData.guardianContact || "",
      };

      const res = await API.post("/patients", payload);

      setPopup({
        message: "✅ Patient registered successfully! Do you want to create a token now?",
        type: "success",
        onConfirm: () => navigate(`/patientProfile/${res.data._id}`),
      });

      setFormData({
        name: "",
        age: "",
        gender: "",
        contact: "",
        guardianName: "",
        guardianContact: "",
        address: "",
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400 && err.response?.data?.message?.includes("contact")) {
        setPopup({
          message: "❌ Contact number already exists. Please use a different contact.",
          type: "error",
        });
      } else {
        setPopup({
          message: "❌ Failed to register patient.",
          type: "error",
        });
      }
    }
  };

  const age = parseInt(formData.age, 10);
  const isMinor = age && age < 18;

  return (
    <div className="page-container">
      <div className="patient-form-container">
        <h2>🧾 Patient Registration</h2>
        <form onSubmit={handleSubmit} className="patient-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="male">Male ♂️</option>
            <option value="female">Female ♀️</option>
            <option value="other">Other ⚧️</option>
          </select>

          {/* 🔹 Only required if adult */}
          {!isMinor && (
            <input
              type="tel"
              name="contact"
              placeholder="Contact Number (11 digits)"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          )}

          {/* 🔹 Only show guardian fields if minor */}
          {isMinor && (
            <>
              <input
                type="text"
                name="guardianName"
                placeholder="Guardian Name"
                value={formData.guardianName}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="guardianContact"
                placeholder="Guardian Contact (11 digits)"
                value={formData.guardianContact}
                onChange={handleChange}
                required
              />
            </>
          )}

          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <button type="submit">Register Patient</button>
        </form>
      </div>

      {popup.message && (
        <PopupMessage
          message={popup.message}
          type={popup.type}
          onClose={() => {
            if (popup.onConfirm) navigate("/dashboard");
            else setPopup({ message: "", type: "" });
          }}
          onConfirm={popup.onConfirm}
          confirmText="Yes, create token"
          cancelText="No, go dashboard"
        />
      )}
    </div>
  );
};

export default PatientForm;
