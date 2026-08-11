const FeeStructure = require("../models/FeeStructure");

// CREATE FEE STRUCTURE
const createFeeStructure = async (req, res) => {
  try {
    const {
      name,
      class: studentClass,
      tuitionFee,
      transportFee = 0,
      examFee = 0,
    } = req.body;

    if (!name || !studentClass || tuitionFee === undefined) {
      return res.status(400).json({
        message: "Name, class and tuition fee are required",
      });
    }

    const totalFee =
      Number(tuitionFee) +
      Number(transportFee) +
      Number(examFee);

    const feeStructure = await FeeStructure.create({
      name,
      class: studentClass,
      tuitionFee: Number(tuitionFee),
      transportFee: Number(transportFee),
      examFee: Number(examFee),
      totalFee,
    });

    res.status(201).json({
      message: "Fee structure created successfully",
      feeStructure,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create fee structure",
      error: error.message,
    });
  }
};

// GET ALL FEE STRUCTURES
const getFeeStructures = async (req, res) => {
  try {
    const feeStructures = await FeeStructure.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: feeStructures.length,
      feeStructures,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fee structures",
      error: error.message,
    });
  }
};

// GET SINGLE FEE STRUCTURE
const getFeeStructureById = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);

    if (!feeStructure) {
      return res.status(404).json({
        message: "Fee structure not found",
      });
    }

    res.status(200).json({
      feeStructure,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fee structure",
      error: error.message,
    });
  }
};

// UPDATE FEE STRUCTURE
const updateFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);

    if (!feeStructure) {
      return res.status(404).json({
        message: "Fee structure not found",
      });
    }

    const {
      name,
      class: studentClass,
      tuitionFee,
      transportFee,
      examFee,
    } = req.body;

    feeStructure.name = name ?? feeStructure.name;
    feeStructure.class = studentClass ?? feeStructure.class;
    feeStructure.tuitionFee =
      tuitionFee ?? feeStructure.tuitionFee;
    feeStructure.transportFee =
      transportFee ?? feeStructure.transportFee;
    feeStructure.examFee =
      examFee ?? feeStructure.examFee;

    feeStructure.totalFee =
      Number(feeStructure.tuitionFee) +
      Number(feeStructure.transportFee) +
      Number(feeStructure.examFee);

    const updatedFeeStructure = await feeStructure.save();

    res.status(200).json({
      message: "Fee structure updated successfully",
      feeStructure: updatedFeeStructure,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update fee structure",
      error: error.message,
    });
  }
};

// DELETE FEE STRUCTURE
const deleteFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);

    if (!feeStructure) {
      return res.status(404).json({
        message: "Fee structure not found",
      });
    }

    await feeStructure.deleteOne();

    res.status(200).json({
      message: "Fee structure deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete fee structure",
      error: error.message,
    });
  }
};

module.exports = {
  createFeeStructure,
  getFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
};