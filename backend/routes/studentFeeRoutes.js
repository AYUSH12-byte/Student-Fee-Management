const express = require("express");

const {
  assignFee,
  getStudentFees,
  getStudentFeeById,
  updateStudentFee,
  deleteStudentFee,
} = require("../controllers/studentFeeController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin only
router.post("/", protect, authorize("admin"), assignFee);

router.get("/", protect, authorize("admin"), getStudentFees);

router.get("/:id", protect, authorize("admin"), getStudentFeeById);

router.put("/:id", protect, authorize("admin"), updateStudentFee);

router.delete("/:id", protect, authorize("admin"), deleteStudentFee);

module.exports = router;
