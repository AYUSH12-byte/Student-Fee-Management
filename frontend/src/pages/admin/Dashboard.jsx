import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard");

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);

      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-600">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg bg-red-50 border border-red-200 p-5 text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      {/* <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Student Fee Management
            </h1>

            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "Admin"}
              </p>

              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav> */}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

          <p className="mt-1 text-gray-500">
            Overview of student fees and collections
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Students */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Students</p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              {summary.totalStudents || 0}
            </h3>
          </div>

          {/* Total Fees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Fees</p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              Rs. {(summary.totalFees || 0).toLocaleString()}
            </h3>
          </div>

          {/* Collected */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Collected</p>

            <h3 className="mt-2 text-3xl font-bold text-green-600">
              Rs. {(summary.totalCollected || 0).toLocaleString()}
            </h3>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Pending</p>

            <h3 className="mt-2 text-3xl font-bold text-red-600">
              Rs. {(summary.totalPending || 0).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Today's Collection */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">
              Today's Collection
            </p>

            <div className="flex items-center justify-between mt-2">
              <h3 className="text-3xl font-bold text-blue-600">
                Rs. {(summary.todayCollection || 0).toLocaleString()}
              </h3>

              <div className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600">
                Today
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Payments
            </h3>
          </div>

          <div className="overflow-x-auto">
            {dashboard?.recentPayments?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Student
                    </th>

                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Amount
                    </th>

                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Method
                    </th>

                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {dashboard.recentPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {payment.studentFeeId?.studentId?.name ||
                            "Unknown Student"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {payment.studentFeeId?.studentId?.studentId || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-800">
                        Rs. {Number(payment.amount || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {payment.paymentMethod || "Cash"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                No payments recorded yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
