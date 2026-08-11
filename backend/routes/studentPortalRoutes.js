const express = require("express");

const {
  getMyFeeStatus,
  getMyPayments,
  getMyReceipts,
  getMyReceiptById,
} = require("../controllers/studentPortalController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Student's own fee information
router.get("/my-fees", protect, getMyFeeStatus);

// Student's own payment history
router.get("/my-payments", protect, getMyPayments);

// Student's own receipts
router.get("/my-receipts", protect, getMyReceipts);

// Student's individual receipt
router.get("/my-receipts/:id", protect, getMyReceiptById);

module.exports = router;
