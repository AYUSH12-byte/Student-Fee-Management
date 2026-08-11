const Student = require("../models/Student");
const StudentFee = require("../models/StudentFee");
const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");

// GET MY PROFILE
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    }).populate("userId", "name email role");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// GET MY FEES
const getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const fees = await StudentFee.find({
      studentId: student._id,
    })
      .populate("feeStructureId")
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);

    const paidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);

    const dueAmount = fees.reduce((sum, fee) => sum + fee.dueAmount, 0);

    res.status(200).json({
      summary: {
        totalAmount,
        paidAmount,
        dueAmount,
      },
      fees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fees",
      error: error.message,
    });
  }
};

// GET MY PAYMENTS
const getMyPayments = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const studentFees = await StudentFee.find({
      studentId: student._id,
    }).select("_id");

    const studentFeeIds = studentFees.map((fee) => fee._id);

    const payments = await Payment.find({
      studentFeeId: { $in: studentFeeIds },
    })
      .populate("studentFeeId", "totalAmount paidAmount dueAmount status")
      .sort({ paymentDate: -1 });

    res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

// GET MY RECEIPTS
const getMyReceipts = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const studentFees = await StudentFee.find({
      studentId: student._id,
    }).select("_id");

    const studentFeeIds = studentFees.map((fee) => fee._id);

    const payments = await Payment.find({
      studentFeeId: { $in: studentFeeIds },
    }).select("_id");

    const paymentIds = payments.map((payment) => payment._id);

    const receipts = await Receipt.find({
      paymentId: { $in: paymentIds },
    })
      .populate("paymentId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: receipts.length,
      receipts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipts",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  getMyFees,
  getMyPayments,
  getMyReceipts,
};
