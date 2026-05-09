import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const session = false;

  if (session) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;