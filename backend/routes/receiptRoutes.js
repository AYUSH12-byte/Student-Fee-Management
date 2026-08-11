const express = require("express");

const {
  createReceipt,
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
  downloadReceiptPDF,
} = require("../controllers/receiptController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Generate receipt manually
router.post("/", protect, authorize("admin"), createReceipt);

// Get all receipts
router.get("/", protect, authorize("admin"), getReceipts);

// Download receipt PDF
router.get(
  "/:id/pdf",
  protect,
  authorize("admin", "student"),
  downloadReceiptPDF,
);

// Get receipt by ID
router.get("/:id", protect, authorize("admin"), getReceiptById);

// Get receipt by payment
router.get(
  "/payment/:paymentId",
  protect,
  authorize("admin"),
  getReceiptByPayment,
);

module.exports = router;
