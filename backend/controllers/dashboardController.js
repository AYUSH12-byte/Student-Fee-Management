const Student = require("../models/Student");
const StudentFee = require("../models/StudentFee");
const Payment = require("../models/Payment");

const getDashboard = async (req, res) => {
  try {
    // Total students
    const totalStudents = await Student.countDocuments();

    // Get all student fee records
    const studentFees = await StudentFee.find();

    // Calculate totals
    const totalFees = studentFees.reduce(
      (sum, fee) => sum + fee.totalAmount,
      0
    );

    const totalCollected = studentFees.reduce(
      (sum, fee) => sum + fee.paidAmount,
      0
    );

    const totalPending = studentFees.reduce(
      (sum, fee) => sum + fee.dueAmount,
      0
    );

    // Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Today's payments
    const todayPayments = await Payment.find({
      paymentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const todayCollection = todayPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Recent payments
    const recentPayments = await Payment.find()
      .populate({
        path: "studentFeeId",
        populate: {
          path: "studentId",
        },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      summary: {
        totalStudents,
        totalFees,
        totalCollected,
        totalPending,
        todayCollection,
      },

      recentPayments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};