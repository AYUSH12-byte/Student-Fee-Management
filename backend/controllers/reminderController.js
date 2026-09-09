const StudentFee = require("../models/StudentFee");
const Reminder = require("../models/Reminder");
const Student = require("../models/Student");
const { sendReminderEmail } = require("../utils/emailService");

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const getReminderPreview = async (req, res) => {
  try {
    const studentFees = await StudentFee.find({ dueAmount: { $gt: 0 } })
      .populate("studentId")
      .populate("feeStructureId")
      .sort({ dueDate: 1 });

    const reminderList = studentFees.map((fee) => {
      const student = fee.studentId;
      const feeName = fee.feeStructureId?.name || "Fee";
      const daysLeft = Math.ceil(
        (new Date(fee.dueDate) - new Date()) / (1000 * 60 * 60 * 24),
      );

      return {
        _id: fee._id,
        studentName: student?.name || "Unknown Student",
        studentEmail: student?.email || "",
        studentPhone: student?.phone || "",
        feeName,
        dueAmount: fee.dueAmount,
        dueDate: fee.dueDate,
        daysLeft: Math.max(daysLeft, 0),
        status: fee.dueAmount > 0 ? "Pending" : "Paid",
        message: `Reminder: Your ${feeName} fee of ${formatCurrency(
          fee.dueAmount,
        )} is due on ${new Date(fee.dueDate).toLocaleDateString()}.`,
      };
    });

    res.status(200).json({
      count: reminderList.length,
      reminders: reminderList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reminder data",
      error: error.message,
    });
  }
};

const sendReminder = async (req, res) => {
  try {
    const { studentFeeId, method = "email" } = req.body;

    if (!studentFeeId) {
      return res.status(400).json({
        message: "Student fee ID is required",
      });
    }

    const studentFee = await StudentFee.findById(studentFeeId)
      .populate("studentId")
      .populate("feeStructureId");

    if (!studentFee) {
      return res.status(404).json({
        message: "Student fee record not found",
      });
    }

    if (studentFee.dueAmount <= 0) {
      return res.status(400).json({
        message: "This fee already has no outstanding balance",
      });
    }

    const student = studentFee.studentId;
    const dueDate = studentFee.dueDate || new Date(Date.now() + 15 * 86400000);
    const message = `Hello ${student?.name || "Student"}, your ${
      studentFee.feeStructureId?.name || "fee"
    } payment of ${formatCurrency(studentFee.dueAmount)} is due on ${new Date(
      dueDate,
    ).toLocaleDateString()}. Please settle it on time.`;

    const emailRecipient = student?.email;

    if (method === "email" || method === "both") {
      if (!emailRecipient) {
        throw new Error(
          "Student has no email address configured for reminder delivery",
        );
      }

      await sendReminderEmail({
        to: emailRecipient,
        subject: `Fee due reminder for ${student?.name || "student"}`,
        text: message,
        html: `<p>${message.replace(/\n/g, "<br />")}</p>`,
      });
    }

    const reminder = await Reminder.create({
      studentId: student?._id,
      studentFeeId: studentFee._id,
      dueAmount: studentFee.dueAmount,
      dueDate,
      method,
      status: "sent",
      message,
      sentAt: new Date(),
    });

    res.status(200).json({
      message: "Reminder sent successfully",
      reminder,
      delivery: {
        method,
        recipient: emailRecipient || student?.phone || "Student",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send reminder",
      error: error.message,
    });
  }
};

const getPendingReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ status: "sent" })
      .populate("studentId")
      .populate("studentFeeId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reminder history",
      error: error.message,
    });
  }
};

const autoSendDueReminders = async () => {
  try {
    const studentFees = await StudentFee.find({
      dueAmount: { $gt: 0 },
      status: { $ne: "Paid" },
    })
      .populate("studentId")
      .populate("feeStructureId");

    const today = new Date();

    for (const fee of studentFees) {
      if (!fee.dueDate) continue;

      const diffDays = Math.ceil(
        (new Date(fee.dueDate) - today) / (1000 * 60 * 60 * 24),
      );

      if (diffDays < 0 || diffDays > 7) continue;

      const reminderExists = await Reminder.findOne({
        studentFeeId: fee._id,
        status: "sent",
        dueDate: fee.dueDate,
      });

      if (reminderExists) continue;

      const message = `Hello ${fee.studentId?.name || "Student"}, your ${
        fee.feeStructureId?.name || "fee"
      } payment of ${formatCurrency(fee.dueAmount)} is due in ${diffDays} day(s).`;

      const emailRecipient = fee.studentId?.email;

      if (emailRecipient) {
        await sendReminderEmail({
          to: emailRecipient,
          subject: `Fee due reminder for ${fee.studentId?.name || "student"}`,
          text: message,
          html: `<p>${message.replace(/\n/g, "<br />")}</p>`,
        });
      }

      await Reminder.create({
        studentId: fee.studentId?._id,
        studentFeeId: fee._id,
        dueAmount: fee.dueAmount,
        dueDate: fee.dueDate,
        method: "email",
        status: "sent",
        message,
        sentAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Auto reminder error:", error.message);
  }
};

module.exports = {
  getReminderPreview,
  sendReminder,
  getPendingReminders,
  autoSendDueReminders,
};
