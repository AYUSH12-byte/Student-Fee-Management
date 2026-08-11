const express = require("express");

const {
  createReceipt,
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
} = require("../controllers/receiptController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin only
router.post("/", protect, authorize("admin"), createReceipt);

router.get("/", protect, authorize("admin"), getReceipts);

router.get("/:id", protect, authorize("admin"), getReceiptById);

router.get(
  "/payment/:paymentId",
  protect,
  authorize("admin"),
  getReceiptByPayment,
);

module.exports = router;
