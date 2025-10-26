import "./dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../../api/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showFindPopup, setShowFindPopup] = useState(false);
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome only after login
  useEffect(() => {
    if (sessionStorage.getItem("showWelcome")) {
      setShowWelcome(true);
      sessionStorage.removeItem("showWelcome");
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

    const handleFindPatient = async (e) => {
      e.preventDefault();
      setError("");

      if (contact.trim().length === 11) {
        try {
          // ✅ Use the correct route to get exact patient by phone
          const res = await API.get(`/patients/phone/${contact.trim()}`);

          if (res.data) {
            const patient = res.data;
            // Navigate to patient-profile page using phone
            navigate(`/patient-profile/${patient.phone}`);
            setShowFindPopup(false);
            setContact("");
          } else {
            setError("No patient found with this phone number.");
          }
        } catch (err) {
          console.error("Error finding patient:", err);
          if (err.response?.status === 404) {
            setError("No patient found with this phone number.");
          } else {
            setError("Error fetching patient data.");
          }
        }
      } else {
        setError("Please enter a valid 11-digit phone number.");
      }
    };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">
      {/* Welcome popup */}
      {showWelcome && (
        <div className="welcome-popup">
          <h2>Welcome, {user?.name || "User"}!</h2>
          <p>Role: {user?.role}</p>
        </div>
      )}

      <header>
        <h2>{user?.name || "User"}</h2>
      </header>

      {/* Doctor Dashboard */}
      {user.role === "doctor" && (
        <div className="receptionist-dashboard">
          <div className="dashboard-column">
            <div className="card" onClick={() => navigate("/token")}>
              <h3>Token List</h3>
              <p>View and manage waiting tokens</p>
            </div>
          </div>
        </div>
      )}

      {/* Receptionist Dashboard */}
      {user.role === "receptionist" && (
        <div className="receptionist-dashboard">
          <div className="dashboard-column">
            <div className="card" onClick={() => navigate("/add-patient")}>
              <h3>Add Patient</h3>
              <p>Register new patients and generate unique IDs</p>
            </div>
            <div className="card" onClick={() => navigate("/patients")}>
              <h3>Patient Info</h3>
              <p>View and manage registered patients</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="dashboard-column">
            <div className="card" onClick={() => setShowFindPopup(true)}>
              <h3>Find Patient</h3>
              <p>Search by phone number</p>
            </div>
            <div className="card" onClick={() => navigate("/token")}>
              <h3>Token List</h3>
              <p>View and manage waiting tokens</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="dashboard-column">
            <div className="card" onClick={() => navigate("/bill")}>
              <h3>Billing</h3>
              <p>Process billing for ongoing or completed tokens</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Find Patient Popup */}
      {showFindPopup && (
        <div
          className="find-popup-overlay"
          onClick={() => setShowFindPopup(false)}
        >
          <div className="find-popup" onClick={(e) => e.stopPropagation()}>
            <h3>🔍 Find Patient</h3>
            <form onSubmit={handleFindPatient}>
              <input
                type="tel"
                placeholder="Enter 11-digit phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
              {error && (
                <p style={{ color: "red", marginTop: "6px" }}>{error}</p>
              )}
              <div className="popup-buttons">
                <button type="submit">Search</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFindPopup(false);
                    setContact("");
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Logout Button */}
      <button className="fixed-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
