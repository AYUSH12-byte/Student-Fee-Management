import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function EditFeeStructure() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    class: "",
    tuitionFee: "",
    transportFee: "",
    examFee: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // GET FEE STRUCTURE
  // =========================
  useEffect(() => {
    const fetchFeeStructure = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/fees/${id}`);

        const fee = response.data.feeStructure || response.data;

        setFormData({
          name: fee.name || "",
          class: fee.class || "",
          tuitionFee: fee.tuitionFee ?? "",
          transportFee: fee.transportFee ?? 0,
          examFee: fee.examFee ?? 0,
        });
      } catch (error) {
        console.error("Fetch Fee Structure Error:", error);

        setError(
          error.response?.data?.message || "Failed to load fee structure",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeeStructure();
  }, [id]);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // CALCULATE TOTAL
  // =========================
  const totalFee =
    Number(formData.tuitionFee || 0) +
    Number(formData.transportFee || 0) +
    Number(formData.examFee || 0);

  // =========================
  // UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Fee structure name is required.");
      return;
    }

    if (!formData.class.trim()) {
      setError("Class is required.");
      return;
    }

    if (formData.tuitionFee === "") {
      setError("Tuition fee is required.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/fees/${id}`, {
        name: formData.name.trim(),
        class: formData.class.trim(),
        tuitionFee: Number(formData.tuitionFee),
        transportFee: Number(formData.transportFee || 0),
        examFee: Number(formData.examFee || 0),
      });

      navigate("/admin/fee-structures");
    } catch (error) {
      console.error("Update Fee Structure Error:", error);

      setError(
        error.response?.data?.message || "Failed to update fee structure",
      );
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
        <p className="text-gray-500">Loading fee structure...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Fee Structure
          </h1>

          <p className="mt-1 text-gray-500">
            Update tuition, transport and examination fees
          </p>
        </div>

        <Link
          to="/admin/fee-structures"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          ← Back
        </Link>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fee Structure Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Class 10 Annual Fee"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Class */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class
                </label>

                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Fee Details */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Fee Details
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Tuition */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tuition Fee
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rs.
                  </span>

                  <input
                    type="number"
                    name="tuitionFee"
                    value={formData.tuitionFee}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Transport */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Transport Fee
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rs.
                  </span>

                  <input
                    type="number"
                    name="transportFee"
                    value={formData.transportFee}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Exam */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Exam Fee
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rs.
                  </span>

                  <input
                    type="number"
                    name="examFee"
                    value={formData.examFee}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mb-8 rounded-xl bg-blue-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Fee</p>

                <p className="mt-1 text-xs text-blue-500">
                  Calculated automatically
                </p>
              </div>

              <p className="text-2xl font-bold text-blue-700">
                Rs. {totalFee.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <Link
              to="/admin/fee-structures"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFeeStructure;
