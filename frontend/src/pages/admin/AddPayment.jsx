import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddPayment() {
  const navigate = useNavigate();

  const [studentFees, setStudentFees] = useState([]);

  const [studentFeeId, setStudentFeeId] = useState("");

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [transactionNumber, setTransactionNumber] = useState("");

  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FETCH STUDENT FEES
  // =========================

  useEffect(() => {
    const fetchStudentFees = async () => {
      try {
        setLoading(true);

        const response = await api.get("/student-fees");

        setStudentFees(response.data.studentFees || []);
      } catch (error) {
        console.error("Fetch Student Fees Error:", error);

        setError(
          error.response?.data?.message || "Failed to load student fees",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentFees();
  }, []);

  // =========================
  // SELECTED FEE
  // =========================

  const selectedFee = studentFees.find((fee) => fee._id === studentFeeId);

  // =========================
  // SUBMIT PAYMENT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!studentFeeId) {
      setError("Please select a student fee.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    if (selectedFee && Number(amount) > Number(selectedFee.dueAmount)) {
      setError(
        `Payment cannot exceed the remaining due amount of Rs. ${Number(
          selectedFee.dueAmount,
        ).toLocaleString()}`,
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/payments", {
        studentFeeId,
        amount: Number(amount),
        paymentDate: paymentDate || undefined,
        paymentMethod,
        transactionNumber: transactionNumber.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      console.log("Payment Response:", response.data);

      navigate("/admin/payments");
    } catch (error) {
      console.error("Record Payment Error:", error);

      setError(error.response?.data?.message || "Failed to record payment");
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
        <p className="text-gray-500">Loading student fees...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>

          <p className="mt-1 text-gray-500">
            Record an offline student fee payment
          </p>
        </div>

        <Link
          to="/admin/payments"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          ← Back
        </Link>
      </div>

      {/* Form */}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Student Fee */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Student
            </label>

            <select
              value={studentFeeId}
              onChange={(e) => {
                setStudentFeeId(e.target.value);
                setAmount("");
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Select Student Fee --</option>

              {studentFees
                .filter((fee) => Number(fee.dueAmount) > 0)
                .map((fee) => (
                  <option key={fee._id} value={fee._id}>
                    {fee.studentId?.name || "Unknown Student"} (
                    {fee.studentId?.studentId || "N/A"}) - Due Rs.{" "}
                    {Number(fee.dueAmount || 0).toLocaleString()}
                  </option>
                ))}
            </select>
          </div>

          {/* Fee Summary */}

          {selectedFee && (
            <div className="mb-6 rounded-xl bg-gray-50 p-5">
              <h2 className="mb-4 font-semibold text-gray-800">Fee Summary</h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Total Fee</p>

                  <p className="mt-1 font-semibold">
                    Rs. {Number(selectedFee.totalAmount || 0).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Previously Paid</p>

                  <p className="mt-1 font-semibold text-green-600">
                    Rs. {Number(selectedFee.paidAmount || 0).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Remaining Due</p>

                  <p className="mt-1 font-semibold text-red-600">
                    Rs. {Number(selectedFee.dueAmount || 0).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Status</p>

                  <p className="mt-1 font-semibold">{selectedFee.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                Rs.
              </span>

              <input
                type="number"
                min="1"
                max={selectedFee?.dueAmount || undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter payment amount"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {selectedFee && (
              <p className="mt-1 text-xs text-gray-500">
                Maximum payment: Rs.{" "}
                {Number(selectedFee.dueAmount).toLocaleString()}
              </p>
            )}
          </div>

          {/* Payment Date */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Date
            </label>

            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Payment Method */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Cash">Cash</option>

              <option value="Bank Transfer">Bank Transfer</option>

              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Transaction Number */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Transaction Number
              <span className="ml-1 text-xs font-normal text-gray-400">
                (Optional)
              </span>
            </label>

            <input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="e.g. TXN123456"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Remarks */}

          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Remarks
              <span className="ml-1 text-xs font-normal text-gray-400">
                (Optional)
              </span>
            </label>

            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any payment notes..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Payment Preview */}

          {selectedFee && amount && Number(amount) > 0 && (
            <div className="mb-8 rounded-xl bg-blue-50 p-5">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">
                  Remaining after payment
                </span>

                <span className="text-lg font-bold text-blue-800">
                  Rs.{" "}
                  {Math.max(
                    0,
                    Number(selectedFee.dueAmount) - Number(amount),
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <Link
              to="/admin/payments"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                studentFees.filter((fee) => Number(fee.dueAmount) > 0)
                  .length === 0
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPayment;
