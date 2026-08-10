const Student = require("../models/Student");

// CREATE STUDENT
const createStudent = async (req, res) => {
  try {
    const {
      userId,
      studentId,
      name,
      class: studentClass,
      section,
      phone,
      address,
    } = req.body;

    if (!userId || !studentId || !name || !studentClass) {
      return res.status(400).json({
        message: "userId, studentId, name and class are required",
      });
    }

    const existingStudent = await Student.findOne({
      $or: [{ userId }, { studentId }],
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    const student = await Student.create({
      userId,
      studentId,
      name,
      class: studentClass,
      section,
      phone,
      address,
    });

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student",
      error: error.message,
    });
  }
};

// GET ALL STUDENTS
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// GET SINGLE STUDENT
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "userId",
      "name email role",
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// UPDATE STUDENT
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const {
      studentId,
      name,
      class: studentClass,
      section,
      phone,
      address,
    } = req.body;

    student.studentId = studentId ?? student.studentId;
    student.name = name ?? student.name;
    student.class = studentClass ?? student.class;
    student.section = section ?? student.section;
    student.phone = phone ?? student.phone;
    student.address = address ?? student.address;

    const updatedStudent = await student.save();

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// DELETE STUDENT
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    await student.deleteOne();

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
