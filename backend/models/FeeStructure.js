const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    class: {
      type: String,
      required: true,
      trim: true,
    },

    tuitionFee: {
      type: Number,
      required: true,
      min: 0,
    },

    transportFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    examFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);