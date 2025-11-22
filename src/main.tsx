import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatbotLanding from "./pages/ChatbotLanding";
import DeepAgentMode from "./pages/DeepAgent";
import AdminSafetyDashboard from "./pages/AdminSafetyDashboard";
import CoachDashboard from "./pages/admin/CoachDashboard";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatbotLanding />} />
        <Route path="/deep" element={<DeepAgentMode />} />
        <Route path="/admin/safety" element={<AdminSafetyDashboard />} />
        <Route path="/admin/coach" element={<CoachDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
