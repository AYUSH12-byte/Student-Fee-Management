const express = require("express");

const {
  getMyProfile,
  getMyFees,
  getMyPayments,
  getMyReceipts,
} = require("../controllers/studentPortalController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/my-profile", protect, authorize("student"), getMyProfile);

router.get("/my-fees", protect, authorize("student"), getMyFees);

router.get("/my-payments", protect, authorize("student"), getMyPayments);

router.get("/my-receipts", protect, authorize("student"), getMyReceipts);

module.exports = router;
