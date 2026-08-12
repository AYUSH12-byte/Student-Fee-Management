import { useEffect, useState } from "react";
import api from "../../services/api";

function MyFees() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/student-portal/my-fees");

      setFees(response.data.fees || []);

      setSummary(
        response.data.summary || {
          totalAmount: 0,
          paidAmount: 0,
          dueAmount: 0,
        },
      );
    } catch (error) {
      console.error("Fetch My Fees Error:", error);

      setError(
        error.response?.data?.message || "Failed to load fee information",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Partial") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading your fees...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Fees</h1>

        <p className="mt-1 text-gray-500">
          View your fee structure and outstanding balance
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        {/* Total */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Fee</p>

          <p className="mt-3 text-3xl font-bold text-gray-900">
            Rs. {Number(summary.totalAmount).toLocaleString()}
          </p>
        </div>

        {/* Paid */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Paid</p>

          <p className="mt-3 text-3xl font-bold text-green-600">
            Rs. {Number(summary.paidAmount).toLocaleString()}
          </p>
        </div>

        {/* Due */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Outstanding Due</p>

          <p className="mt-3 text-3xl font-bold text-red-600">
            Rs. {Number(summary.dueAmount).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Fee Table */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-semibold text-gray-800">Fee Details</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fee Structure
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Class
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
                fees.map((fee) => {
                  const structure = fee.feeStructureId;

                  return (
                    <tr key={fee._id} className="hover:bg-gray-50">
                      {/* Fee Name */}

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {structure?.name || "Fee Structure"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Tuition: Rs.{" "}
                          {Number(structure?.tuitionFee || 0).toLocaleString()}
                        </p>
                      </td>

                      {/* Class */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {structure?.class || "N/A"}
                      </td>

                      {/* Total */}

                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        Rs. {Number(fee.totalAmount || 0).toLocaleString()}
                      </td>

                      {/* Paid */}

                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        Rs. {Number(fee.paidAmount || 0).toLocaleString()}
                      </td>

                      {/* Due */}

                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        Rs. {Number(fee.dueAmount || 0).toLocaleString()}
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            fee.status,
                          )}`}
                        >
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No fee records found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Your assigned fees will appear here.
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

export default MyFees;
