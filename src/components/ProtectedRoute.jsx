import React from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = authService.getCurrentUser();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

