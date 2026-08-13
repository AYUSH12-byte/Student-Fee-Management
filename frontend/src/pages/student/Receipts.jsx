import { useEffect, useState } from "react";
import api from "../../services/api";

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/student-portal/my-receipts");

      setReceipts(response.data.receipts || []);
    } catch (error) {
      console.error("Fetch Receipts Error:", error);

      setError(error.response?.data?.message || "Failed to load receipts");
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

  const downloadReceipt = async (receiptId, receiptNumber) => {
    try {
      const response = await api.get(`/receipts/${receiptId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${receiptNumber || "receipt"}.pdf`;

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
        <p className="text-gray-500">Loading receipts...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Receipts</h1>

        <p className="mt-1 text-gray-500">
          View and download your payment receipts.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Receipt Count */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Total Receipts</p>

        <p className="mt-2 text-3xl font-bold text-gray-900">
          {receipts.length}
        </p>
      </div>

      {/* Receipts Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment Receipts
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Receipt Number
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Payment Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Payment Method
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {receipts.length > 0 ? (
                receipts.map((receipt) => {
                  const payment = receipt.paymentId;

                  return (
                    <tr key={receipt._id} className="hover:bg-gray-50">
                      {/* Receipt Number */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">
                          {receipt.receiptNumber}
                        </span>
                      </td>

                      {/* Payment Date */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(payment?.paymentDate)}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        {formatCurrency(payment?.amount)}
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {payment?.paymentMethod || "Cash"}
                        </span>
                      </td>

                      {/* Download */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            downloadReceipt(receipt._id, receipt.receiptNumber)
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No receipts found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Your receipts will appear here after payments are
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

export default Receipts;
