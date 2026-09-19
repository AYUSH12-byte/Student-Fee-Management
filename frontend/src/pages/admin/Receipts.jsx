import { useEffect, useState } from "react";
import api from "../../services/api";

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/receipts");

      setReceipts(response.data.receipts || []);
    } catch (error) {
      console.error("Fetch Receipts Error:", error);

      setError(error.response?.data?.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const downloadReceipt = async (receipt) => {
    try {
      const response = await api.get(`/receipts/${receipt._id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${receipt.receiptNumber}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Receipt Error:", error);

      alert(error.response?.data?.message || "Failed to download receipt");
    }
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const payment = receipt.paymentId;
    const student = payment?.studentFeeId?.studentId;

    if (!student) {
      return false;
    }

    const searchText = search.toLowerCase().trim();

    return (
      receipt.receiptNumber?.toLowerCase().includes(searchText) ||
      student.name?.toLowerCase().includes(searchText) ||
      student.studentId?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading receipts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>

          <p className="mt-1 text-gray-500">
            View and download student payment receipts
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt number or student..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Receipt
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Payment Method
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => {
                  const payment = receipt.paymentId;
                  const student = payment?.studentFeeId?.studentId;

                  return (
                    <tr key={receipt._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {receipt.receiptNumber}
                        </p>

                        <p className="text-xs text-gray-400">
                          Generated{" "}
                          {receipt.createdAt
                            ? new Date(receipt.createdAt).toLocaleDateString()
                            : ""}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {student.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {student.studentId}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          Rs. {Number(payment?.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {payment?.paymentMethod || ""}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment?.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : ""}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => downloadReceipt(receipt)}
                          className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No receipts found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Receipts will appear here after payments are recorded.
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
