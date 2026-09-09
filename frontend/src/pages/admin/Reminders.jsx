import { useEffect, useState } from "react";
import api from "../../services/api";

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reminders/preview");
      setReminders(response.data.reminders || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const sendReminder = async (studentFeeId, method = "email") => {
    try {
      setSending(true);
      setError("");

      await api.post("/reminders/send", {
        studentFeeId,
        method,
      });

      await fetchReminders();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send reminder");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading reminders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Reminders</h1>
          <p className="mt-1 text-gray-500">
            Send due-date reminders for pending student fees.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Due Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Days Left
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {reminders.length > 0 ? (
                reminders.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {item.studentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.studentEmail || "No email"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.feeName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      Rs. {Number(item.dueAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        {item.daysLeft} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => sendReminder(item._id, "email")}
                        disabled={sending}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        {sending ? "Sending..." : "Send Reminder"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="font-medium text-gray-600">
                      No pending reminders
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      All due fees are current or no fee record is overdue.
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

export default Reminders;
