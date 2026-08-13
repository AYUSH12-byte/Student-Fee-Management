import { useEffect, useState } from "react";
import api from "../../services/api";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
  });
  const [fees, setFees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, feesResponse] = await Promise.all([
          api.get("/student-portal/my-profile"),
          api.get("/student-portal/my-fees"),
        ]);

        setProfile(profileResponse.data.student);

        setSummary(
          feesResponse.data.summary || {
            totalAmount: 0,
            paidAmount: 0,
            dueAmount: 0,
          },
        );

        setFees(feesResponse.data.fees || []);
      } catch (error) {
        console.error("Student Dashboard Error:", error);

        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {profile?.userId?.name || profile?.name || "Student"}
          👋
        </h1>

        <p className="mt-1 text-gray-500">
          Here's an overview of your fee status.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Student Information */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
            {(profile?.userId?.name || profile?.name || "S")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {profile?.userId?.name || profile?.name || "Student"}
            </h2>

            <p className="text-sm text-gray-500">
              Student ID: {profile?.studentId || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Fee */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Fee</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(summary.totalAmount)}
          </p>

          <p className="mt-2 text-xs text-gray-400">Total assigned fees</p>
        </div>

        {/* Paid */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Paid Amount</p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(summary.paidAmount)}
          </p>

          <p className="mt-2 text-xs text-gray-400">Total amount paid</p>
        </div>

        {/* Due */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Outstanding Due</p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(summary.dueAmount)}
          </p>

          <p className="mt-2 text-xs text-gray-400">Remaining amount to pay</p>
        </div>
      </div>

      {/* Fee Statu */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800">My Fee Status</h2>

          <p className="mt-1 text-sm text-gray-500">
            Overview of your assigned fee structures
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fee Structure
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Paid
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Due
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {fees.length > 0 ? (
                fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {fee.feeStructureId?.name || "Fee Structure"}
                      </p>

                      <p className="text-xs text-gray-500">
                        Class: {fee.feeStructureId?.class || "N/A"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {formatCurrency(fee.totalAmount)}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {formatCurrency(fee.paidAmount)}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-red-600">
                      {formatCurrency(fee.dueAmount)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          fee.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : fee.status === "Partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No fees assigned
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Your fee information will appear here once assigned by the
                      school.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
