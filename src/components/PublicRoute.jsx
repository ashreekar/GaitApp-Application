import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

const PublicRoute = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;