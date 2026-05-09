import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
//   const session = localStorage.getItem("session");
  const session = false;

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;