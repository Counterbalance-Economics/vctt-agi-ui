import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DeepAgentMode from "./pages/DeepAgent";
import AdminSafetyDashboard from "./pages/AdminSafetyDashboard";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/deep" element={<DeepAgentMode />} />
        <Route path="/admin/safety" element={<AdminSafetyDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
