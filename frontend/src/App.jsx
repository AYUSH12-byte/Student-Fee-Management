import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";

import Dashboard from "./pages/admin/Dashboard";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* ADMIN ROUTES */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* /admin → /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          {/*STUDENT ROUTE - TEMPORARY*/}

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <h1 className="p-8 text-3xl font-bold">Student Dashboard</h1>
              </ProtectedRoute>
            }
          />

          {/* Invalid URL */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
