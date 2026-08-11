const Receipt = require("../models/Receipt");

// GET ALL RECEIPTS - ADMIN
const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find()
      .populate("studentId")
      .populate("generatedBy", "name email")
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

// GET SINGLE RECEIPT
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate("studentId")
      .populate("generatedBy", "name email")
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

// GET RECEIPT BY PAYMENT
const getReceiptByPayment = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({
      paymentId: req.params.paymentId,
    })
      .populate("studentId")
      .populate("generatedBy", "name email")
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
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
};