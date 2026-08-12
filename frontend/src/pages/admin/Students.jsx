import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/students");

      // Supports either:
      // { students: [...] }
      // or directly [...]
      setStudents(response.data.students || response.data);
    } catch (error) {
      console.error("Fetch Students Error:", error);

      setError(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/students/${id}`);

      setStudents((currentStudents) =>
        currentStudents.filter((student) => student._id !== id),
      );
    } catch (error) {
      console.error("Delete Student Error:", error);

      alert(error.response?.data?.message || "Failed to delete student");
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText) ||
      student.studentId?.toLowerCase().includes(searchText) ||
      student.phone?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading students...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>

          <p className="mt-1 text-gray-500">
            Manage student profiles and information
          </p>
        </div>

        <Link
          to="/admin/students/add"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Student
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {/* Main Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Search */}
        <div className="border-b border-gray-200 p-5">
          <div className="max-w-md">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search Students
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, email or phone..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
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
                  Student ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contact
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="transition hover:bg-gray-50">
                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                          {student.name?.charAt(0).toUpperCase() || "S"}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {student.name || "N/A"}
                          </p>

                          <p className="text-sm text-gray-500">
                            {student.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {student.studentId || "N/A"}
                    </td>

                    {/* Class */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {student.class
                        ? `${student.class}${
                            student.section ? ` - ${student.section}` : ""
                          }`
                        : "N/A"}
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {student.phone || student.contact || "N/A"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          student.status === "Inactive"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {student.status || "Active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/students/edit/${student._id}`}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(student._id)}
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No students found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Try another search or add a new student.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">{students.length}</span>{" "}
            students
          </p>
        </div>
      </div>
    </div>
  );
}

export default Students;
