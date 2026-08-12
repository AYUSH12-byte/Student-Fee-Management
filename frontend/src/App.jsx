import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import AddStudent from "./pages/admin/AddStudent";
import EditStudent from "./pages/admin/EditStudent";
import FeeStructures from "./pages/admin/FeeStructures";




import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* =========================
              DEFAULT
          ========================== */}

          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* =========================
              LOGIN
          ========================== */}

          <Route path="/login" element={<Login />} />

          {/* =========================
              ADMIN ROUTES
          ========================== */}

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

            {/* Students */}
            <Route path="students" element={<Students />} />
            
            {/* Add Students */}
            <Route path="students/add" element={<AddStudent />} />
             
            {/* Edit Students */}
            <Route path="students/edit/:id"element={<EditStudent />}/>
            
            {/* Fee Structures */}
            <Route path="fee-structures"element={<FeeStructures />}/>
          </Route>

          {/* =========================
              STUDENT ROUTES
          ========================== */}

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <h1 className="p-8 text-3xl font-bold">Student Dashboard</h1>
              </ProtectedRoute>
            }
          />

          {/* =========================
              INVALID URL
          ========================== */}

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
