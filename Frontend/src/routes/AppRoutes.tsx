import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Resources from "../pages/Resources";
import Findings from "../pages/Findings";
import SecurityScore from "../pages/SecurityScore";
import AIAssistant from "../pages/AIAssistant";
import Remediation from "../pages/Remediation";
import AuditLogs from "../pages/AuditLogs";
import Settings from "../pages/Settings";
import Connect from "../pages/Connect";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Landing from "../pages/Landing";
import Platform from "../pages/Platform";
import Security from "../pages/Security";
import Docs from "../pages/Docs";

const ProtectedRoute = () => {
  const token = localStorage.getItem("cloudshield_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/security" element={<Security />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Signed-in app */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/score" element={<SecurityScore />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/remediation" element={<Remediation />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/connect" element={<Connect />} />
      </Route>

      {/* Anything else goes home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;