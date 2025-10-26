import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login/login";
import Dashboard from "./components/Dashboard/dashboard";
import Token from "./components/Token/token";
import Bill from "./components/Bill/bill";
import Patients from "./components/Patients/patients";
import PatientProfile from "./components/PatientProfile/patientProfile";
import PatientForm from "./components/patientForm";
import Prescriptions from "./components/prescriptionCard";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import { AuthProvider, useAuth } from "./components/context/AuthContext";

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard (shared by both roles) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["doctor", "receptionist"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Patients list page */}
          <Route
            path="/patients"
            element={
              <ProtectedRoute allowedRoles={["doctor", "receptionist"]}>
                <Patients />
              </ProtectedRoute>
            }
          />

          {/* Patient profile by MongoDB ID (legacy route) */}
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute allowedRoles={["doctor", "receptionist"]}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          {/* Patient profile by phone */}
          <Route
            path="/patient-profile/:phone"
            element={
              <ProtectedRoute allowedRoles={["doctor", "receptionist"]}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: Prescriptions route now uses :phone instead of :tokenId */}
          <Route
            path="/prescriptions/:phone"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <Prescriptions />
              </ProtectedRoute>
            }
          />

          {/* Add patient (receptionist only) */}
          <Route
            path="/add-patient"
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <PatientForm />
              </ProtectedRoute>
            }
          />

          {/* Token route (shared) */}
          <Route
            path="/token"
            element={
              <ProtectedRoute allowedRoles={["doctor", "receptionist"]}>
                <Token />
              </ProtectedRoute>
            }
          />

          {/* Billing (receptionist only) */}
          <Route
            path="/bill"
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <Bill />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
