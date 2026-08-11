const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFee",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque"],
      default: "Cash",
    },

    transactionNumber: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);