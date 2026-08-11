const express = require("express");

const {
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
} = require("../controllers/receiptController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getReceipts);

router.get(
  "/payment/:paymentId",
  protect,
  authorize("admin"),
  getReceiptByPayment,
);

router.get("/:id", protect, authorize("admin"), getReceiptById);

module.exports = router;
