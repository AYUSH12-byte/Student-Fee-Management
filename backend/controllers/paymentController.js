const Payment = require("../models/Payment");
const StudentFee = require("../models/StudentFee");

// CREATE PAYMENT
const createPayment = async (req, res) => {
  try {
    const {
      studentFeeId,
      amount,
      paymentDate,
      paymentMethod,
      transactionNumber,
      remarks,
    } = req.body;

    if (!studentFeeId || amount === undefined) {
      return res.status(400).json({
        message: "Student fee ID and payment amount are required",
      });
    }

    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    // Find student fee
    const studentFee = await StudentFee.findById(studentFeeId);

    if (!studentFee) {
      return res.status(404).json({
        message: "Student fee record not found",
      });
    }

    // Check if already fully paid
    if (studentFee.dueAmount <= 0) {
      return res.status(400).json({
        message: "This fee has already been fully paid",
      });
    }

    // Prevent overpayment
    if (paymentAmount > studentFee.dueAmount) {
      return res.status(400).json({
        message: `Payment cannot exceed the remaining due amount of Rs. ${studentFee.dueAmount}`,
      });
    }

    // Create payment
    const payment = await Payment.create({
      studentFeeId,
      amount: paymentAmount,
      paymentDate: paymentDate || Date.now(),
      paymentMethod: paymentMethod || "Cash",
      transactionNumber,
      remarks,
      recordedBy: req.user.id,
    });

    // Update paid amount
    studentFee.paidAmount += paymentAmount;

    // Calculate due amount
    studentFee.dueAmount = studentFee.totalAmount - studentFee.paidAmount;

    // Update status
    if (studentFee.dueAmount === 0) {
      studentFee.status = "Paid";
    } else {
      studentFee.status = "Partial";
    }

    await studentFee.save();

    // Return payment with related information
    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: "studentFeeId",
        populate: [
          {
            path: "studentId",
          },
          {
            path: "feeStructureId",
          },
        ],
      })
      .populate("recordedBy", "name email");

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: populatedPayment,
      feeStatus: {
        totalAmount: studentFee.totalAmount,
        paidAmount: studentFee.paidAmount,
        dueAmount: studentFee.dueAmount,
        status: studentFee.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

// GET ALL PAYMENTS
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "studentFeeId",
        populate: {
          path: "studentId",
        },
      })
      .populate("recordedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// GET SINGLE PAYMENT
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "studentFeeId",
        populate: [
          {
            path: "studentId",
          },
          {
            path: "feeStructureId",
          },
        ],
      })
      .populate("recordedBy", "name email");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.status(200).json({
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

// GET PAYMENTS FOR A STUDENT FEE
const getPaymentsByStudentFee = async (req, res) => {
  try {
    const payments = await Payment.find({
      studentFeeId: req.params.studentFeeId,
    })
      .populate("recordedBy", "name email")
      .sort({ paymentDate: -1 });

    res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student payment history",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByStudentFee,
};
