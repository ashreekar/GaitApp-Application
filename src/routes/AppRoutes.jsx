import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Layout from "../components/Layout";

import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Live from "../pages/Live";
import History from "../pages/History";
import Details from "../pages/Details";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>

        <Routes>

          {/* Public Route */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/live"
            element={
              <ProtectedRoute>
                <Live />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/details/:id"
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            }
          />

          <Route path="/settings" element={
            <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

        </Routes>

      </Layout>
    </BrowserRouter>
  );
}