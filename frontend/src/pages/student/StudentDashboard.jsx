import { useEffect, useState } from "react";
import api from "../../services/api";

function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [feeData, setFeeData] = useState({
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, feeResponse] = await Promise.all([
        api.get("/student-portal/my-profile"),
        api.get("/student-portal/my-fees"),
      ]);

      setProfile(profileResponse.data.student);

      setFeeData(
        feeResponse.data.summary || {
          totalAmount: 0,
          paidAmount: 0,
          dueAmount: 0,
        },
      );
    } catch (error) {
      console.error("Student Dashboard Error:", error);

      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  const paidPercentage =
    feeData.totalAmount > 0
      ? Math.round((feeData.paidAmount / feeData.totalAmount) * 100)
      : 0;

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>

        <p className="mt-1 text-gray-500">
          Welcome back,{" "}
          <span className="font-medium text-gray-700">
            {profile?.userId?.name || profile?.name || "Student"}
          </span>
        </p>
      </div>

      {/* Student Info */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Student Name</p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {profile?.name || profile?.userId?.name || "N/A"}
            </h2>
          </div>

          <div>
            <p className="text-sm text-gray-500">Student ID</p>

            <p className="mt-1 font-semibold text-gray-800">
              {profile?.studentId || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Class</p>

            <p className="mt-1 font-semibold text-gray-800">
              {profile?.class || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Section</p>

            <p className="mt-1 font-semibold text-gray-800">
              {profile?.section || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Fee Cards */}

      <div className="grid gap-5 md:grid-cols-3">
        {/* Total */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Fee</p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            Rs. {Number(feeData.totalAmount).toLocaleString()}
          </h2>
        </div>

        {/* Paid */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Paid</p>

          <h2 className="mt-3 text-3xl font-bold text-green-600">
            Rs. {Number(feeData.paidAmount).toLocaleString()}
          </h2>
        </div>

        {/* Due */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Outstanding Due</p>

          <h2 className="mt-3 text-3xl font-bold text-red-600">
            Rs. {Number(feeData.dueAmount).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Payment Progress */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">
              Fee Payment Progress
            </h2>

            <p className="text-sm text-gray-500">
              {paidPercentage}% of your total fee has been paid
            </p>
          </div>

          <span className="text-lg font-bold text-blue-600">
            {paidPercentage}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${paidPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
