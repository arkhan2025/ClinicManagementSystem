import React, { useState, useEffect } from "react";
import API from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import "./prescriptionCard.css";

const PrescriptionCard = () => {
  const { phone } = useParams(); // phone from URL
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchTokenAndPrescription = async () => {
      try {
        const tokenRes = await API.get(`/token/phone/${phone}`);
        const tokenData = tokenRes.data;
        setToken(tokenData);

        try {
          const prescriptionRes = await API.get(`/prescriptions/${tokenData._id}`);
          const prescriptionData = prescriptionRes.data.prescription;

          if (prescriptionData) {
            setMedicines(prescriptionData.meds || []);
            setNotes(prescriptionData.notes || "");
            setDiscount(prescriptionData.discount || 0);
          }
        } catch (err) {
          if (err.response && err.response.status === 404) return;
          console.error("Error fetching prescription:", err);
        }
      } catch (err) {
        console.error("Error fetching token:", err);
      }
    };

    if (phone) fetchTokenAndPrescription();
  }, [phone]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        beforeMeal: false,
        afterMeal: false,
        morning: false,
        noon: false,
        night: false,
        quantity: "",
      },
    ]);
  };

  const updateMedicine = (idx, key, value) => {
    const meds = [...medicines];
    meds[idx][key] = value;
    setMedicines(meds);
  };

  const savePrescription = async () => {
    try {
      await API.post("/prescriptions", {
        tokenId: token._id,
        meds: medicines,
        notes,
        discount,
      });
      alert("Prescription saved successfully!");
      navigate("/token");
    } catch (err) {
      console.error("Error completing prescription:", err.response?.data || err.message);
    }
  };

  const handleComplete = () => {
    if (!token) return;
    if (discount > 50) {
      setShowConfirmModal(true);
    } else {
      savePrescription();
    }
  };

  const handleConfirmDiscount = () => {
    setShowConfirmModal(false);
    savePrescription();
  };

  const handleCancelDiscount = () => {
    setShowConfirmModal(false);
  };

  if (!token) return <p>Loading prescription...</p>;

  return (
    <div className="prescription-card-page">
      <h2>Prescription for {token.patient?.name || token.patientPhone}</h2>

      {medicines.map((med, idx) => (
        <div key={idx} className="medicine-row">
          <input
            type="text"
            placeholder="Medicine Name"
            value={med.name}
            onChange={(e) => updateMedicine(idx, "name", e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={med.beforeMeal}
              onChange={(e) => updateMedicine(idx, "beforeMeal", e.target.checked)}
            />
            Before Meal
          </label>
          <label>
            <input
              type="checkbox"
              checked={med.afterMeal}
              onChange={(e) => updateMedicine(idx, "afterMeal", e.target.checked)}
            />
            After Meal
          </label>
          <label>
            <input
              type="checkbox"
              checked={med.morning}
              onChange={(e) => updateMedicine(idx, "morning", e.target.checked)}
            />
            Morning
          </label>
          <label>
            <input
              type="checkbox"
              checked={med.noon}
              onChange={(e) => updateMedicine(idx, "noon", e.target.checked)}
            />
            Noon
          </label>
          <label>
            <input
              type="checkbox"
              checked={med.night}
              onChange={(e) => updateMedicine(idx, "night", e.target.checked)}
            />
            Night
          </label>
          <input
            type="number"
            placeholder="Quantity"
            value={med.quantity}
            onChange={(e) => updateMedicine(idx, "quantity", e.target.value)}
          />
        </div>
      ))}

      <button className="add" onClick={addMedicine}>
        Add Medicine
      </button>

      <div className="notes-section">
        <textarea
          placeholder="Doctor's Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="discount-section">
        <label>Doctor Discount (max 50%)</label>
        <input
          type="number"
          max={100}
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
        />
      </div>

      <button className="complete-btn" onClick={handleComplete}>
        Complete
      </button>

      {/* Discount Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>High Discount Warning</h3>
            <p>Discount is above 50%. Are you sure you want to proceed?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleConfirmDiscount}>
                Yes, Proceed
              </button>
              <button className="cancel-btn" onClick={handleCancelDiscount}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionCard;
