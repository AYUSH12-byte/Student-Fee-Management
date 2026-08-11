const express = require("express");

const {
  createFeeStructure,
  getFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
} = require("../controllers/feeController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin only
router.post("/", protect, authorize("admin"), createFeeStructure);

router.get("/", protect, authorize("admin"), getFeeStructures);

router.get("/:id", protect, authorize("admin"), getFeeStructureById);

router.put("/:id", protect, authorize("admin"), updateFeeStructure);

router.delete("/:id", protect, authorize("admin"), deleteFeeStructure);

module.exports = router;
