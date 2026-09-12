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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/score" element={<SecurityScore />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/remediation" element={<Remediation />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;