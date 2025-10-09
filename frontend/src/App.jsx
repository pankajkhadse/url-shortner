import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPages from "./components/AuthPages";
import Dashboard from "./components/Dashboard";
import Swal from 'sweetalert2';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("uid"));

  // Enhanced token change detection
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage changed - updating token state");
      const newToken = localStorage.getItem("uid");
      setToken(newToken);
    };

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange);
    
    // Also check for token changes periodically
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("uid");
      if (currentToken !== token) {
        console.log("Token changed detected via interval");
        setToken(currentToken);
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);



  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <AuthPages />}
      />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

// Export SweetAlert for use in other components
export { Swal };