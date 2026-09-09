const express = require("express");

const {
  getReminderPreview,
  sendReminder,
  getPendingReminders,
} = require("../controllers/reminderController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/preview", protect, authorize("admin"), getReminderPreview);
router.post("/send", protect, authorize("admin"), sendReminder);
router.get("/history", protect, authorize("admin"), getPendingReminders);

module.exports = router;
