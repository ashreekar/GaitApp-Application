import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;