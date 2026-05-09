import Navbar from "./Navbar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const session = false;

  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/auth");
    }
  }, [session, navigate]);

  return (
    <div>
      {session && <Navbar />}
      <main>{children}</main>
    </div>
  );
}