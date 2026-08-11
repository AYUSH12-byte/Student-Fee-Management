import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <h1 className="text-3xl font-bold p-8">
              Admin Dashboard
            </h1>
          }
        />

        {/* Student */}
        <Route
          path="/student/dashboard"
          element={
            <h1 className="text-3xl font-bold p-8">
              Student Dashboard
            </h1>
          }
        />

        {/* Invalid route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;