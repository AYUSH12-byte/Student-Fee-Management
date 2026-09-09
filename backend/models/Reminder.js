const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    studentFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFee",
      required: true,
    },

    dueAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    method: {
      type: String,
      enum: ["email", "sms", "both"],
      default: "email",
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    message: {
      type: String,
      required: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reminderSchema.index({ studentFeeId: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model("Reminder", reminderSchema);
