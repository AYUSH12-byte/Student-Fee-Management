const Payment = require("../models/Payment");
const StudentFee = require("../models/StudentFee");
const Receipt = require("../models/Receipt");

// CREATE PAYMENT + AUTOMATIC RECEIPT
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

    // Validate input
    if (!studentFeeId || amount === undefined) {
      return res.status(400).json({
        message: "Student fee ID and payment amount are required",
      });
    }

    const paymentAmount = Number(amount);

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

    // Check already paid
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

    // ==========================================
    // CREATE PAYMENT
    // ==========================================

    const payment = await Payment.create({
      studentFeeId,
      amount: paymentAmount,
      paymentDate: paymentDate || Date.now(),
      paymentMethod: paymentMethod || "Cash",
      transactionNumber,
      remarks,
      recordedBy: req.user.id,
    });

    // ==========================================
    // UPDATE STUDENT FEE
    // ==========================================

    studentFee.paidAmount += paymentAmount;

    studentFee.dueAmount = studentFee.totalAmount - studentFee.paidAmount;

    if (studentFee.dueAmount === 0) {
      studentFee.status = "Paid";
    } else {
      studentFee.status = "Partial";
    }

    await studentFee.save();

    // ==========================================
    // GENERATE RECEIPT AUTOMATICALLY
    // ==========================================

    const year = new Date().getFullYear();

    const receiptCount = await Receipt.countDocuments();

    const receiptNumber = `REC-${year}-${String(receiptCount + 1).padStart(5, "0")}`;

    const receipt = await Receipt.create({
      paymentId: payment._id,
      receiptNumber,
    });

    // ==========================================
    // POPULATE RESPONSE
    // ==========================================

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

    const populatedReceipt = await Receipt.findById(receipt._id);

    // ==========================================
    // RESPONSE
    // ==========================================

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
    console.error("Create Payment Error:", error);

    res.status(500).json({
      message: "Failed to record payment",
      error: error.message,
    });
  }
};
