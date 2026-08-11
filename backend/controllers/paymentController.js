const Payment = require("../models/Payment");
const StudentFee = require("../models/StudentFee");
const Receipt = require("../models/Receipt");

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

    // Validate required fields
    if (!studentFeeId || amount === undefined) {
      return res.status(400).json({
        message: "Student fee ID and payment amount are required",
      });
    }

    const paymentAmount = Number(amount);

    // Validate payment amount
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
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

    // Save previous paid amount for receipt
    const previousPaidAmount = studentFee.paidAmount;

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

    // Calculate remaining due
    studentFee.dueAmount =
      studentFee.totalAmount - studentFee.paidAmount;

    // Update status
    if (studentFee.dueAmount === 0) {
      studentFee.status = "Paid";
    } else {
      studentFee.status = "Partial";
    }

    await studentFee.save();

    // Generate receipt number
    const receiptNumber = `REC-${new Date().getFullYear()}-${Date.now()}`;

    // Create receipt automatically
    const receipt = await Receipt.create({
      receiptNumber,
      paymentId: payment._id,
      studentFeeId: studentFee._id,
      studentId: studentFee.studentId,
      amountPaid: paymentAmount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      previousPaidAmount,
      remainingDue: studentFee.dueAmount,
      generatedBy: req.user.id,
    });

    // Get populated payment
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

    // Get populated receipt
    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate("studentId")
      .populate("generatedBy", "name email")
      .populate("paymentId")
      .populate("studentFeeId");

    // Response
    res.status(201).json({
      message: "Payment recorded and receipt generated successfully",

      payment: populatedPayment,

      receipt: populatedReceipt,

      feeStatus: {
        totalAmount: studentFee.totalAmount,
        paidAmount: studentFee.paidAmount,
        dueAmount: studentFee.dueAmount,
        status: studentFee.status,
      },
    });
  } catch (error) {
    console.error("Payment Error:", error);

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
        populate: [
          {
            path: "studentId",
          },
          {
            path: "feeStructureId",
          },
        ],
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