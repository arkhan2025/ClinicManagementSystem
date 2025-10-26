import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { useAuth } from "../context/AuthContext";
import "./patients.css";

const Patients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get("/patients");
        setPatients(res.data);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <p>Loading patients...</p>;

  return (
    <div className="patients-page">
      <h2>Patients List</h2>
      {patients.length === 0 ? (
        <p className="no-data">No patients found.</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Contact</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr
                key={p._id}
                className="clickable"
                onClick={() => navigate(`/patient-profile/${p.phone}`)}
              >
                <td>{p.name}</td>
                <td>{p.age}</td>
                <td>{p.phone || "N/A"}</td>
                <td>{p.address || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Patients;
