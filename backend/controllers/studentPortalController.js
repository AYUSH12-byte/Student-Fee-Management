const Student = require("../models/Student");
const StudentFee = require("../models/StudentFee");
const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");

// GET MY FEE STATUS
const getMyFeeStatus = async (req, res) => {
  try {
    // req.user.id comes from JWT authentication
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
    })
      .populate("feeStructureId")
      .sort({ createdAt: -1 });

    if (studentFees.length === 0) {
      return res.status(200).json({
        message: "No fee records found",
        student,
        summary: {
          totalAmount: 0,
          paidAmount: 0,
          dueAmount: 0,
        },
        fees: [],
      });
    }

    const totalAmount = studentFees.reduce(
      (sum, fee) => sum + fee.totalAmount,
      0
    );

    const paidAmount = studentFees.reduce(
      (sum, fee) => sum + fee.paidAmount,
      0
    );

    const dueAmount = studentFees.reduce(
      (sum, fee) => sum + fee.dueAmount,
      0
    );

    res.status(200).json({
      student,

      summary: {
        totalAmount,
        paidAmount,
        dueAmount,
      },

      fees: studentFees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fee status",
      error: error.message,
    });
  }
};

// GET MY PAYMENT HISTORY
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

    const studentFeeIds = studentFees.map(
      (fee) => fee._id
    );

    const payments = await Payment.find({
      studentFeeId: {
        $in: studentFeeIds,
      },
    })
      .populate({
        path: "studentFeeId",
        populate: {
          path: "feeStructureId",
        },
      })
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

    const receipts = await Receipt.find({
      studentId: student._id,
    })
      .populate("paymentId")
      .populate("studentFeeId")
      .sort({ paymentDate: -1 });

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

// GET SINGLE RECEIPT
const getMyReceiptById = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const receipt = await Receipt.findOne({
      _id: req.params.id,
      studentId: student._id,
    })
      .populate("paymentId")
      .populate("studentFeeId");

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found",
      });
    }

    res.status(200).json({
      receipt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message,
    });
  }
};

module.exports = {
  getMyFeeStatus,
  getMyPayments,
  getMyReceipts,
  getMyReceiptById,
};