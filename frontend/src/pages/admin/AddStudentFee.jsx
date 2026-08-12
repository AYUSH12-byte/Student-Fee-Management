import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddStudentFee() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [feeStructureId, setFeeStructureId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FETCH STUDENTS + FEES
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentsResponse, feesResponse] = await Promise.all([
          api.get("/students"),
          api.get("/fees"),
        ]);

        console.log("Students:", studentsResponse.data);

        console.log("Fee Structures:", feesResponse.data);

        setStudents(studentsResponse.data.students || []);

        setFeeStructures(feesResponse.data.feeStructures || []);
      } catch (error) {
        console.error("Fetch Assign Fee Data Error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load students and fee structures",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =========================
  // SELECTED FEE
  // =========================
  const selectedFee = feeStructures.find((fee) => fee._id === feeStructureId);

  // =========================
  // SELECTED STUDENT
  // =========================
  const selectedStudent = students.find((student) => student._id === studentId);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!studentId) {
      setError("Please select a student.");
      return;
    }

    if (!feeStructureId) {
      setError("Please select a fee structure.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/student-fees", {
        studentId,
        feeStructureId,
      });

      navigate("/admin/student-fees");
    } catch (error) {
      console.error("Assign Fee Error:", error);

      setError(error.response?.data?.message || "Failed to assign fee");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assign Fee</h1>

          <p className="mt-1 text-gray-500">
            Assign a fee structure to a student
          </p>
        </div>

        <Link
          to="/admin/student-fees"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          ← Back
        </Link>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Student */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Student
            </label>

            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Select Student --</option>

              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}{" "}
                  {student.studentId ? `(${student.studentId})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Student Preview */}
          {selectedStudent && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-800">
                Student Information
              </h3>

              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="text-gray-500">Name</p>

                  <p className="font-medium text-gray-800">
                    {selectedStudent.name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Student ID</p>

                  <p className="font-medium text-gray-800">
                    {selectedStudent.studentId || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Class</p>

                  <p className="font-medium text-gray-800">
                    {selectedStudent.class || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fee Structure */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Fee Structure
            </label>

            <select
              value={feeStructureId}
              onChange={(e) => setFeeStructureId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Select Fee Structure --</option>

              {feeStructures.map((fee) => (
                <option key={fee._id} value={fee._id}>
                  {fee.name} - Class {fee.class} - Rs.{" "}
                  {Number(fee.totalFee || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Preview */}
          {selectedFee && (
            <div className="mb-8 rounded-xl bg-blue-50 p-5">
              <h3 className="mb-4 font-semibold text-blue-800">Fee Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuition Fee</span>

                  <span className="font-medium">
                    Rs. {Number(selectedFee.tuitionFee || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Transport Fee</span>

                  <span className="font-medium">
                    Rs. {Number(selectedFee.transportFee || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Exam Fee</span>

                  <span className="font-medium">
                    Rs. {Number(selectedFee.examFee || 0).toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-800">
                      Total Fee
                    </span>

                    <span className="text-xl font-bold text-blue-700">
                      Rs. {Number(selectedFee.totalFee || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial Payment Information */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Initial Payment</p>

            <p className="mt-1 text-sm text-gray-500">
              The student will be assigned the full fee amount with a payment of
              Rs. 0.
            </p>

            <div className="mt-3 flex justify-between text-sm">
              <span>Initial Status</span>

              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                Pending
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <Link
              to="/admin/student-fees"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving || students.length === 0 || feeStructures.length === 0
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Assigning..." : "Assign Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentFee;
