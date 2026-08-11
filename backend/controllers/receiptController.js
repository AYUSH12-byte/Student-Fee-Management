const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");

// Generate unique receipt number
const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Receipt.countDocuments();

  const number = String(count + 1).padStart(5, "0");

  return `REC-${year}-${number}`;
};

// CREATE RECEIPT
const createReceipt = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: "Payment ID is required",
      });
    }

    // Check payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Check existing receipt
    const existingReceipt = await Receipt.findOne({
      paymentId,
    });

    if (existingReceipt) {
      return res.status(400).json({
        message: "Receipt already exists for this payment",
        receipt: existingReceipt,
      });
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Create receipt
    const receipt = await Receipt.create({
      paymentId,
      receiptNumber,
    });

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate({
        path: "paymentId",
        populate: {
          path: "studentFeeId",
          populate: [
            {
              path: "studentId",
            },
            {
              path: "feeStructureId",
            },
          ],
        },
      });

    res.status(201).json({
      message: "Receipt generated successfully",
      receipt: populatedReceipt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate receipt",
      error: error.message,
    });
  }
};

// GET ALL RECEIPTS
const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find()
      .populate({
        path: "paymentId",
        populate: {
          path: "studentFeeId",
          populate: {
            path: "studentId",
          },
        },
      })
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

// GET SINGLE RECEIPT
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate({
        path: "paymentId",
        populate: {
          path: "studentFeeId",
          populate: [
            {
              path: "studentId",
            },
            {
              path: "feeStructureId",
            },
          ],
        },
      });

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

// GET RECEIPT BY PAYMENT
const getReceiptByPayment = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({
      paymentId: req.params.paymentId,
    }).populate({
      path: "paymentId",
      populate: {
        path: "studentFeeId",
        populate: [
          {
            path: "studentId",
          },
          {
            path: "feeStructureId",
          },
        ],
      },
    });

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found for this payment",
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
  createReceipt,
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
};