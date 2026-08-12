import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function FeeStructures() {
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =========================
  // GET ALL FEE STRUCTURES
  // =========================
  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/fees");

      console.log("Fee Structure Response:", response.data);

      setFeeStructures(response.data.feeStructures || []);
    } catch (error) {
      console.error("Fetch Fee Structures Error:", error);

      console.log("Status:", error.response?.status);

      console.log("Response:", error.response?.data);

      setError(
        error.response?.data?.message || "Failed to load fee structures",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  // =========================
  // DELETE FEE STRUCTURE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fee structure?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/fees/${id}`);

      setFeeStructures((current) => current.filter((fee) => fee._id !== id));
    } catch (error) {
      console.error("Delete Fee Structure Error:", error);

      alert(error.response?.data?.message || "Failed to delete fee structure");
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredFeeStructures = feeStructures.filter((fee) => {
    const searchText = search.toLowerCase();

    return (
      fee.name?.toLowerCase().includes(searchText) ||
      fee.class?.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading fee structures...</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <div>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Structures</h1>

          <p className="mt-1 text-gray-500">
            Manage tuition, transport and examination fees
          </p>
        </div>

        <Link
          to="/admin/fee-structures/add"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Fee Structure
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {/* TABLE CARD */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* SEARCH */}
        <div className="border-b border-gray-200 p-5">
          <div className="max-w-md">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by fee name or class..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fee Name
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tuition
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Transport
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Exam
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredFeeStructures.length > 0 ? (
                filteredFeeStructures.map((fee) => (
                  <tr key={fee._id} className="transition hover:bg-gray-50">
                    {/* NAME */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{fee.name}</p>
                    </td>

                    {/* CLASS */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {fee.class}
                    </td>

                    {/* TUITION */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Rs. {Number(fee.tuitionFee || 0).toLocaleString()}
                    </td>

                    {/* TRANSPORT */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Rs. {Number(fee.transportFee || 0).toLocaleString()}
                    </td>

                    {/* EXAM */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Rs. {Number(fee.examFee || 0).toLocaleString()}
                    </td>

                    {/* TOTAL */}
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      Rs. {Number(fee.totalFee || 0).toLocaleString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/fee-structures/edit/${fee._id}`}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(fee._id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No fee structures found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Add your first fee structure.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {filteredFeeStructures.length}
            </span>{" "}
            fee structure
            {filteredFeeStructures.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeeStructures;
