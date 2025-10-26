import "./token.css";
import { useEffect, useState } from "react";
import API from "../../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Token = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [editingToken, setEditingToken] = useState(null);
  const [newIssue, setNewIssue] = useState("");

  const fetchTokens = async () => {
    try {
      const res = await API.get("/token"); // fetch all tokens

      // ✅ Populate patient info for each token
      const tokensWithPatient = await Promise.all(
        res.data
          .filter((t) => t.status === "waiting") // only show waiting tokens
          .map(async (t) => {
            try {
              const patientRes = await API.get(`/patients/phone/${t.patientPhone}`);
              return { ...t, patient: patientRes.data };
            } catch (err) {
              console.error(`Error fetching patient for token ${t._id}:`, err);
              return t;
            }
          })
      );

      setTokens(tokensWithPatient);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // ✅ update handler using patientPhone and current status (no _id)
  const handleUpdateIssue = async (token, status = undefined) => {
    try {
      const payload = {
        patientPhone: token.patientPhone,
        currentStatus: token.status,
      };

      if (status === undefined) {
        // Update issue text
        payload.issue = newIssue;
        payload.newStatus = token.status; // keep current status
      } else {
        // Update status only
        payload.newStatus = status;
      }

      await API.put("/token", payload); // backend should find token using patientPhone + currentStatus

      setEditingToken(null);
      setNewIssue("");
      fetchTokens();
      navigate("/token"); // redirect after update
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ when starting to edit, load the existing issue into input
  const handleStartEdit = (token) => {
    setEditingToken(token._id);
    setNewIssue(token.issue || "");
  };

  return (
    <div className="token-page">
      <h2>🎟️ Active Tokens</h2>
      <table className="token-table">
        <thead>
          <tr>
            <th>Token No.</th>
            <th>Patient Name</th>
            <th>Age</th>
            <th>Contact</th>
            <th>Guardian</th>
            <th>Issue</th>
            <th>Created At</th>
            {user.role === "receptionist" && <th>Actions</th>}
            {user.role === "doctor" && <th>Prescribe</th>}
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t._id}>
              <td>{t.tokenNumber}</td>
              <td
                className="clickable"
                onClick={() => navigate(`/patient-profile/${t.patientPhone}`)}
              >
                {t.patient?.name || "-"}
              </td>
              <td>{t.patient?.age || "-"}</td>
              <td>{t.patientPhone}</td>
              <td>
                {t.patient?.age < 18
                  ? `${t.patient?.guardianName || "-"} (${
                      t.patient?.guardianContact || "-"
                    })`
                  : "N/A"}
              </td>
              <td>
                {editingToken === t._id && user.role === "receptionist" ? (
                  <div className="edit-issue">
                    <input
                      value={newIssue}
                      onChange={(e) => setNewIssue(e.target.value)}
                    />
                    <button onClick={() => handleUpdateIssue(t, "absent")}>
                      Absent
                    </button>
                  </div>
                ) : (
                  t.issue
                )}
              </td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>

              {user.role === "receptionist" && (
                <td>
                  {editingToken === t._id ? (
                    <button onClick={() => setEditingToken(null)}>Cancel</button>
                  ) : (
                    <button className="pres" onClick={() => handleStartEdit(t)}>Edit</button>
                  )}
                </td>
              )}

              {user.role === "doctor" && (
                <td>
                  <button
                    className="pres"
                    onClick={() => navigate(`/prescriptions/${t.patientPhone}`)}
                  >
                    Prescribe
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Token;
