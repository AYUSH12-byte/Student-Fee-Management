import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

                // Admin
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import AddStudent from "./pages/admin/AddStudent";
import EditStudent from "./pages/admin/EditStudent";
import FeeStructures from "./pages/admin/FeeStructures";
import AddFeeStructure from "./pages/admin/AddFeeStructure";
import EditFeeStructure from "./pages/admin/EditFeeStructure";
import StudentFees from "./pages/admin/StudentFees";
import AddStudentFee from "./pages/admin/AddStudentFee";
import Payments from "./pages/admin/Payments";
import AddPayment from "./pages/admin/AddPayment";
import Receipts from "./pages/admin/Receipts";

                //  student
import StudentDashboard from "./pages/student/Dashboard";
import MyFees from "./pages/student/MyFees";
import StudentPayments from "./pages/student/Payments";
import StudentReceipts from "./pages/student/Receipts";


import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT*/}

          <Route path="/" element={<Navigate to="/login" replace />} />

          {/*  LOGIN */}

          <Route path="/login" element={<Login />} />

          {/* ADMIN ROUTES*/}

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>} >
            {/* /admin → /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Students */}
            <Route path="students" element={<Students />} />

            {/* Add Students */}
            <Route path="students/add" element={<AddStudent />} />

            {/* Edit Students */}
            <Route path="students/edit/:id" element={<EditStudent />} />

            {/* Fee Structures */}
            <Route path="fee-structures" element={<FeeStructures />} />

            {/* Add Fee Structures */}
            <Route path="fee-structures/add" element={<AddFeeStructure />} />

            {/* Edit Fee Structures */}
            <Route
              path="fee-structures/edit/:id"
              element={<EditFeeStructure />}
            />

            {/* Student Fees */}
            <Route path="student-fees" element={<StudentFees />} />

            {/* Add Student Fees */}
            <Route path="student-fees/add" element={<AddStudentFee />} />

            {/* Payments */}
            <Route path="payments" element={<Payments />} />

            {/* Add Payment */}
            <Route path="payments/add" element={<AddPayment />} />

            {/* Receipts */}
            <Route path="receipts" element={<Receipts />} />
          </Route>

               {/*  STUDENT ROUTES*/}

          <Route path="/student"element={ <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute> } >
           
           {/* /student → /student/dashboard */}
            <Route index element={<Navigate to="/student/dashboard" replace />}/>
          
           {/* Dashboard */}
            <Route path="dashboard" element={<StudentDashboard />} />
          
           {/* Fees */}
            <Route path="fees" element={<MyFees />} />
             
          {/* Payments */}  
            <Route path="payments" element={<StudentPayments />} />
           
           {/* Receipts */}  
            <Route path="receipts"element={<StudentReceipts />}/>
          </Route>

          {/* INVALID URL */}

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
