import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { useAuth } from "../context/AuthContext";
import "./patientProfile.css";

const PatientProfile = () => {
  const { id, phone } = useParams();
  const patientIdentifier = phone || id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [popup, setPopup] = useState({ show: false, issue: "" });
  const [editPopup, setEditPopup] = useState({
    show: false,
    name: "",
    age: "",
    contact: "",
  });
  const [currentPhone, setCurrentPhone] = useState("");
  const [prescriptionPopup, setPrescriptionPopup] = useState({
    show: false,
    data: null,
  });

  // Fetch patient info
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        let res;
        if (phone) {
          res = await API.get(`/patients/phone/${patientIdentifier}`);
        } else {
          res = await API.get(`/patients/${patientIdentifier}`);
        }

        setPatient(res.data);
        setEditPopup({
          show: false,
          name: res.data.name,
          age: res.data.age,
          contact: res.data.phone,
        });
        setCurrentPhone(res.data.phone);
      } catch (err) {
        console.error("Error fetching patient:", err);
      }
    };

    if (patientIdentifier) fetchPatient();
  }, [patientIdentifier, phone]);

  // Fetch all tokens for that patient
  useEffect(() => {
    const fetchTokens = async () => {
      if (!currentPhone) return;

      try {
        const res = await API.get(`/token?patientPhone=${currentPhone.trim()}`);
        setTokens(
          res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        console.error("Error fetching tokens:", err);
      }
    };

    fetchTokens();
  }, [currentPhone]);

  // Create new token
  const handleCreateToken = async () => {
    if (!popup.issue.trim()) return alert("Issue is required!");

    try {
      const payload = {
        patientId: patient._id,
        issue: popup.issue.trim(),
      };

      const response = await API.post("/token", payload);

      if (response.status === 201) {
        setPopup({ show: false, issue: "" });

        const res = await API.get(`/token?patientPhone=${patient.phone.trim()}`);
        setTokens(
          res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } else {
        alert("Failed to create token.");
      }
    } catch (err) {
      console.error("Error creating token:", err);
      alert(err.response?.data?.message || "Failed to create token.");
    }
  };

  // Edit patient info
  const handleEditPatient = async () => {
    if (!editPopup.name || !editPopup.age || !editPopup.contact) {
      return alert("All fields are required!");
    }

    try {
      await API.put(`/patients/${patient._id}`, {
        name: editPopup.name,
        age: editPopup.age,
        phone: editPopup.contact,
      });

      setEditPopup({ ...editPopup, show: false });

      const res = await API.get(`/patients/phone/${editPopup.contact}`);
      setPatient(res.data);
      setCurrentPhone(res.data.phone);
    } catch (err) {
      console.error("Error updating patient:", err);
      alert("Failed to update patient info.");
    }
  };

  // Check active token
  const hasActiveToken = tokens.some(
    (t) => t.status === "waiting" || t.status === "processing"
  );

  // Fetch prescription for a specific token
  const handleViewPrescription = async (token) => {
    try {
      const res = await API.get(`/prescriptions?patientPhone=${token.patientPhone}`);
      const allPrescriptions = res.data;

      const sortedTokens = [...tokens].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const currentIndex = sortedTokens.findIndex((t) => t._id === token._id);
      const nextToken = sortedTokens[currentIndex + 1];

      const currentCreated = new Date(token.createdAt);
      const nextCreated = nextToken ? new Date(nextToken.createdAt) : null;

      const prescription = allPrescriptions.find((p) => {
        const pTime = new Date(p.createdAt);
        return (
          pTime >= currentCreated &&
          (!nextCreated || pTime < nextCreated)
        );
      });

      if (prescription) {
        setPrescriptionPopup({ show: true, data: prescription });
      } else {
        alert("No prescription found for this visit.");
      }
    } catch (err) {
      console.error("Error fetching prescription:", err);
      alert("Failed to load prescription.");
    }
  };

  if (!patient) return <p>Loading patient info...</p>;

  return (
    <div className="patient-profile">
      <div className="profile-content">
        <h2>{patient.name}'s Profile</h2>
        <p>
          <strong>Age:</strong> {patient.age}
        </p>
        <p>
          <strong>Contact:</strong> {patient.phone}
        </p>
        <p>
          <strong>Address:</strong> {patient.address || "-"}
        </p>
        {patient.age < 18 && (
          <p>
            <strong>Guardian:</strong> {patient.guardianName} (
            {patient.guardianContact})
          </p>
        )}

        {/* Receptionist buttons */}
        {user.role === "receptionist" && (
          <div className="token-btn-container">
            <button
              onClick={() => setPopup({ show: true, issue: "" })}
              disabled={hasActiveToken}
              className={`token-btn ${hasActiveToken ? "disabled-btn" : ""}`}
            >
              {hasActiveToken ? "Token already exists" : "Create Token"}
            </button>
            <button onClick={() => setEditPopup({ ...editPopup, show: true })}>
              Edit Patient
            </button>
          </div>
        )}

        {/* Create Token Popup */}
        {popup.show && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Enter Issue for Token</h3>
              <input
                type="text"
                placeholder="Issue"
                value={popup.issue}
                onChange={(e) =>
                  setPopup({ ...popup, issue: e.target.value })
                }
              />
              <div className="popup-buttons">
                <button
                  onClick={handleCreateToken}
                  disabled={!popup.issue.trim()}
                >
                  Submit
                </button>
                <button
                  onClick={() => setPopup({ show: false, issue: "" })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Patient Popup */}
        {editPopup.show && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Edit</h3>
              <input
                type="text"
                placeholder="Name"
                value={editPopup.name}
                onChange={(e) =>
                  setEditPopup({ ...editPopup, name: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Age"
                value={editPopup.age}
                onChange={(e) =>
                  setEditPopup({ ...editPopup, age: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Contact"
                value={editPopup.contact}
                onChange={(e) =>
                  setEditPopup({ ...editPopup, contact: e.target.value })
                }
              />
              <div className="popup-buttons">
                <button onClick={handleEditPatient}>Update</button>
                <button
                  onClick={() => setEditPopup({ ...editPopup, show: false })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visit History */}
        <h3>Visit History</h3>
        {tokens.length === 0 ? (
          <p className="no-data">No previous visits.</p>
        ) : (
          <table className="tokens-history">
            <thead>
              <tr>
                <th>Token No.</th>
                <th>Status</th>
                <th>Issue</th>
                <th>Date</th>
                {user.role === "doctor" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t._id}>
                  <td>{t.tokenNumber}</td>
                  <td>{t.status}</td>
                  <td>{t.issue}</td>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  {user.role === "doctor" && (
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewPrescription(t)}
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Prescription Popup */}
        {prescriptionPopup.show && prescriptionPopup.data && (
          <div className="popup-overlay">
            <div className="popup-content prescription-popup">
              <h2>Prescription</h2>
              <p>
                <strong>Patient:</strong> {patient.name}
              </p>
              <p>
                <strong>Phone:</strong> {patient.phone}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(prescriptionPopup.data.createdAt).toLocaleString()}
              </p>
              <hr />
              <h4>Medicines</h4>
              {prescriptionPopup.data.meds && prescriptionPopup.data.meds.length > 0 ? (
                <table className="prescription-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Consumption</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionPopup.data.meds.map((m, i) => {
                      // 🧠 Construct display text
                      const before = m.beforeMeal;
                      const after = m.afterMeal;
                      const mealText =
                        before && after
                          ? "Before and after meal"
                          : before
                          ? "Before meal"
                          : after
                          ? "After meal"
                          : "Patient convenience";

                      const morning = m.morning ? 1 : 0;
                      const noon = m.noon ? 1 : 0;
                      const night = m.night ? 1 : 0;
                      const timePattern = `${morning} + ${noon} + ${night}`;

                      return (
                        <tr key={i}>
                          <td>{m.name}</td>
                          <td>{`${mealText} | ${timePattern}`}</td>
                          <td>{m.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No medicines listed.</p>
              )}
              <p>
                <strong>Consultation Notes:</strong>{" "}
                {prescriptionPopup.data.notes || "-"}
              </p>
              <p>
                <strong>Discount:</strong> {prescriptionPopup.data.discount || 0}%
              </p>
              <div className="popup-buttons">
                <button
                  onClick={() =>
                    setPrescriptionPopup({ show: false, data: null })
                  }
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
