const express = require("express");

const {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByStudentFee,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin only
router.post("/", protect, authorize("admin"), createPayment);

router.get("/", protect, authorize("admin"), getPayments);

router.get("/:id", protect, authorize("admin"), getPaymentById);

router.get(
  "/student-fee/:studentFeeId",
  protect,
  authorize("admin"),
  getPaymentsByStudentFee,
);

module.exports = router;
