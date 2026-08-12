import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function StudentFees() {
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/student-fees");

      console.log("Student Fees:", response.data);

      setStudentFees(response.data.studentFees || []);
    } catch (error) {
      console.error("Fetch Student Fees Error:", error);

      setError(error.response?.data?.message || "Failed to load student fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentFees();
  }, []);

  const filteredFees = studentFees.filter((item) => {
    const student = item.studentId;

    const searchText = search.toLowerCase();

    return (
      student?.name?.toLowerCase().includes(searchText) ||
      student?.studentId?.toLowerCase().includes(searchText) ||
      item.status?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading student fees...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Fees</h1>

          <p className="mt-1 text-gray-500">
            Manage student fee assignments and balances
          </p>
        </div>

        <Link
          to="/admin/student-fees/add"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Assign Fee
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Search */}
        <div className="border-b border-gray-200 p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or status..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              {filteredFees.length > 0 ? (
                filteredFees.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {item.studentId?.name || "Unknown Student"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.studentId?.studentId || ""}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.feeStructureId?.name || "Fee Structure"}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold">
                      Rs. {Number(item.totalAmount || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-green-600">
                      Rs. {Number(item.paidAmount || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-red-600">
                      Rs. {Number(item.dueAmount || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No student fees found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Assign a fee structure to a student.
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

export default StudentFees;
