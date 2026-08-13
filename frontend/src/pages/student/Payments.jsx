import { useEffect, useState } from "react";
import api from "../../services/api";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/student-portal/my-payments");

      setPayments(response.data.payments || []);
    } catch (error) {
      console.error("Fetch Payments Error:", error);

      setError(
        error.response?.data?.message || "Failed to load payment history",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading payment history...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>

        <p className="mt-1 text-gray-500">
          View all payments recorded against your fees.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Total Payments */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Total Payments</p>

        <p className="mt-2 text-3xl font-bold text-gray-900">
          {payments.length}
        </p>
      </div>

      {/* Payment Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Transaction History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Payment Method
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Transaction Number
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fee Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {payments.length > 0 ? (
                payments.map((payment) => {
                  const fee = payment.studentFeeId;

                  return (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(payment.paymentDate)}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </td>

                      {/* Method */}
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {payment.paymentMethod || "Cash"}
                        </span>
                      </td>

                      {/* Transaction */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.transactionNumber || "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            fee?.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : fee?.status === "Partial"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {fee?.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No payments found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Your payment history will appear here after a payment is
                      recorded.
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

export default Payments;
