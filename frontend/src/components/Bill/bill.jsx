import "./bill.css";
import { useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

const Bill = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);
  const [contact, setContact] = useState("");
  const [token, setToken] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [userPayment, setUserPayment] = useState("");

  // Fetch token by phone number and status "seen"
  const handleFetchToken = async () => {
    if (!contact.trim()) return alert("Please enter a phone number");

    try {
      // Exclude tokens with status "completed"
      const res = await API.get(`/token?patientPhone=${contact.trim()}&status=seen`);
      const availableTokens = res.data.filter((t) => t.status !== "completed");

      if (availableTokens.length === 0) {
        alert("No token with status 'seen' found for this contact!");
        return;
      }

      const fetchedToken = availableTokens[0];

      // Fetch latest prescription for this token's patient
      const prescriptionRes = await API.get(`/prescriptions/${fetchedToken._id}`);
      const prescription = prescriptionRes.data.prescription || {};

      // Attach prescription to token for easy access
      fetchedToken.prescription = prescription;

      setToken(fetchedToken);
      setShowPopup(false);

      // Precalculate bill with doctor's fee and discount
      const doctorFee = 1000;
      const discount = prescription.discount || 0;
      const medicineFee =
        prescription.meds?.reduce((sum, m) => sum + (m.price || 0), 0) || 0;

      const discountedDoctorFee = doctorFee - doctorFee * (discount / 100);
      const total = discountedDoctorFee + medicineFee;

      setBillDetails({
        doctorFee: discountedDoctorFee,
        medicineFee,
        discount,
        total,
        userPayment: 0,
        returnAmount: 0,
        name: fetchedToken.patient.name,
        phone: fetchedToken.patient.phone,
        age: fetchedToken.patient.age,
        issue: fetchedToken.issue,
        tokenNumber: fetchedToken.tokenNumber,
      });
    } catch (err) {
      console.error("Error fetching token or prescription:", err);
      alert("Error fetching token or prescription");
    }
  };

  // Update bill calculations when user enters payment
  const handleUserPaymentChange = (value) => {
    setUserPayment(value);

    if (!billDetails) return;

    const paid = Number(value) || 0;
    const returnAmount = paid - billDetails.total > 0 ? paid - billDetails.total : 0;

    setBillDetails((prev) => ({
      ...prev,
      userPayment: paid,
      returnAmount,
    }));
  };

  // Complete billing: store in DB and update token status
  const handleComplete = async () => {
    if (!billDetails || !token) return;

    if (billDetails.userPayment < billDetails.total) {
      return alert("Patient has not paid full amount!");
    }

    try {
      // 1️⃣ Save billing record
      await API.post("/billing", {
        patient: token.patient._id,
        patientPhone: token.patient.phone,
        token: token._id,
        amount: billDetails.total,
        paidAmount: billDetails.userPayment,
        returnAmount: billDetails.returnAmount,
        discount: billDetails.discount,
      });

      // 2️⃣ Find the token by patientPhone and status "seen"
      const tokenRes = await API.get(`/token?patientPhone=${token.patient.phone}&status=seen`);
      const availableTokens = tokenRes.data.filter((t) => t.status !== "completed");

      if (availableTokens.length > 0) {
        const tokenToUpdate = availableTokens[0];

        // ✅ Proper PUT request using phone and status
        await API.put("/token", {
          patientPhone: tokenToUpdate.patientPhone,
          currentStatus: "seen",
          newStatus: "completed",
        });
      }

      alert("Billing completed successfully!");
      // Reset to initial state
      setShowPopup(true);
      setToken(null);
      setBillDetails(null);
      setContact("");
      setUserPayment("");

      // 3️⃣ Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error completing billing:", err);
      alert("Error completing billing");
    }
  };

  return (
    <div className="bill-container">
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Enter Patient Contact</h3>
            <input
              type="text"
              placeholder="Patient or Guardian Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <button onClick={handleFetchToken}>Fetch Token</button>
          </div>
        </div>
      )}

      {!showPopup && token && billDetails && (
        <div className="bill-card">
          <h2>Billing for {billDetails.name}</h2>
          <p><strong>Phone:</strong> {billDetails.phone}</p>
          <p><strong>Age:</strong> {billDetails.age}</p>
          <p><strong>Issue:</strong> {billDetails.issue}</p>
          <p><strong>Token No:</strong> {billDetails.tokenNumber}</p>
          <p><strong>Doctor Fee (after discount):</strong> {billDetails.doctorFee} Tk</p>
          <p><strong>Medicine Fee:</strong> {billDetails.medicineFee} Tk</p>
          <p><strong>Discount Applied:</strong> {billDetails.discount}%</p>
          <p><strong>Total Amount:</strong> {billDetails.total} Tk</p>

          <div className="payment-section">
            <label>
              Amount Provided by Patient:
              <input
                type="number"
                min="0"
                value={userPayment}
                onChange={(e) => handleUserPaymentChange(e.target.value)}
              />
            </label>
            {billDetails.returnAmount > 0 && (
              <p><strong>Return Amount:</strong> {billDetails.returnAmount} Tk</p>
            )}
          </div>

          <button className="complete-btn" onClick={handleComplete}>
            Complete Billing
          </button>
        </div>
      )}
    </div>
  );
};

export default Bill;
