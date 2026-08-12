import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments");

      setPayments(response.data.payments || []);
    } catch (error) {
      console.error("Fetch Payments Error:", error);

      setError(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const student = payment.studentFeeId?.studentId;

    const searchText = search.toLowerCase();

    return (
      student?.name?.toLowerCase().includes(searchText) ||
      student?.studentId?.toLowerCase().includes(searchText) ||
      payment.paymentMethod?.toLowerCase().includes(searchText) ||
      payment.transactionNumber?.toLowerCase().includes(searchText)
    );
  });

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/receipts/payment/${paymentId}`);

      const receiptId = response.data.receipt?._id;

      if (!receiptId) {
        alert("Receipt not found.");
        return;
      }

      const pdfResponse = await api.get(`/receipts/${receiptId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([pdfResponse.data], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${receiptId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Receipt Error:", error);

      alert(error.response?.data?.message || "Failed to download receipt");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading payments...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>

          <p className="mt-1 text-gray-500">
            View and manage student payment records
          </p>
        </div>

        <Link
          to="/admin/payments/add"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Record Payment
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Main Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Search */}
        <div className="border-b border-gray-200 p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, payment method or transaction..."
            className="w-full max-w-lg rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Method
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Transaction
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Receipt
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const student = payment.studentFeeId?.studentId;

                  return (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      {/* Student */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {student?.name || "Unknown Student"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {student?.studentId || ""}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          Rs. {Number(payment.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {payment.paymentMethod}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* Transaction */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.transactionNumber || "N/A"}
                      </td>

                      {/* Receipt */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => downloadReceipt(payment._id)}
                          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No payments found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Record a payment to see it here.
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
