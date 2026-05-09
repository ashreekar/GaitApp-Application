import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/Layout";

import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Live from "../pages/Live";
import History from "../pages/History";
import Details from "../pages/Details";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/live" element={<Live />} />
          <Route path="/history" element={<History />} />

          {/* Dynamic Route */}
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}