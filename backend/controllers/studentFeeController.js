const StudentFee = require("../models/StudentFee");
const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");

// ASSIGN FEE TO STUDENT
const assignFee = async (req, res) => {
  try {
    const { studentId, feeStructureId } = req.body;

    if (!studentId || !feeStructureId) {
      return res.status(400).json({
        message: "Student ID and fee structure ID are required",
      });
    }

    // Check student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Check fee structure
    const feeStructure = await FeeStructure.findById(feeStructureId);

    if (!feeStructure) {
      return res.status(404).json({
        message: "Fee structure not found",
      });
    }

    // Check if already assigned
    const existingFee = await StudentFee.findOne({
      studentId,
      feeStructureId,
    });

    if (existingFee) {
      return res.status(400).json({
        message: "This fee structure is already assigned to this student",
      });
    }

    const studentFee = await StudentFee.create({
      studentId,
      feeStructureId,
      totalAmount: feeStructure.totalFee,
      paidAmount: 0,
      dueAmount: feeStructure.totalFee,
      status: "Pending",
    });

    const populatedFee = await StudentFee.findById(studentFee._id)
      .populate("studentId")
      .populate("feeStructureId");

    res.status(201).json({
      message: "Fee assigned to student successfully",
      studentFee: populatedFee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign fee",
      error: error.message,
    });
  }
};

// GET ALL STUDENT FEES
const getStudentFees = async (req, res) => {
  try {
    const studentFees = await StudentFee.find()
      .populate("studentId")
      .populate("feeStructureId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: studentFees.length,
      studentFees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student fees",
      error: error.message,
    });
  }
};

// GET FEE BY ID
const getStudentFeeById = async (req, res) => {
  try {
    const studentFee = await StudentFee.findById(req.params.id)
      .populate("studentId")
      .populate("feeStructureId");

    if (!studentFee) {
      return res.status(404).json({
        message: "Student fee record not found",
      });
    }

    res.status(200).json({
      studentFee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student fee",
      error: error.message,
    });
  }
};

// UPDATE FEE ASSIGNMENT
const updateStudentFee = async (req, res) => {
  try {
    const studentFee = await StudentFee.findById(req.params.id);

    if (!studentFee) {
      return res.status(404).json({
        message: "Student fee record not found",
      });
    }

    const { feeStructureId } = req.body;

    if (feeStructureId) {
      const feeStructure = await FeeStructure.findById(feeStructureId);

      if (!feeStructure) {
        return res.status(404).json({
          message: "Fee structure not found",
        });
      }

      studentFee.feeStructureId = feeStructureId;
      studentFee.totalAmount = feeStructure.totalFee;
      studentFee.dueAmount = feeStructure.totalFee - studentFee.paidAmount;
    }

    if (studentFee.dueAmount <= 0) {
      studentFee.dueAmount = 0;
      studentFee.status = "Paid";
    } else if (studentFee.paidAmount > 0) {
      studentFee.status = "Partial";
    } else {
      studentFee.status = "Pending";
    }

    const updatedStudentFee = await studentFee.save();

    const populatedFee = await StudentFee.findById(updatedStudentFee._id)
      .populate("studentId")
      .populate("feeStructureId");

    res.status(200).json({
      message: "Student fee updated successfully",
      studentFee: populatedFee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student fee",
      error: error.message,
    });
  }
};

// DELETE FEE ASSIGNMENT
const deleteStudentFee = async (req, res) => {
  try {
    const studentFee = await StudentFee.findById(req.params.id);

    if (!studentFee) {
      return res.status(404).json({
        message: "Student fee record not found",
      });
    }

    await studentFee.deleteOne();

    res.status(200).json({
      message: "Student fee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student fee",
      error: error.message,
    });
  }
};

module.exports = {
  assignFee,
  getStudentFees,
  getStudentFeeById,
  updateStudentFee,
  deleteStudentFee,
};
