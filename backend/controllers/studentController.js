const Student = require("../models/Student");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ======================================================
// CREATE STUDENT + USER ACCOUNT
// ======================================================

const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      name,
      email,
      class: studentClass,
      section,
      phone,
      address,
      password,
    } = req.body;

    if (!studentId || !name || !email || !studentClass) {
      return res.status(400).json({
        message: "Student ID, name, email and class are required",
      });
    }

    const studentEmail = email.toLowerCase().trim();

    // Check existing student
    const existingStudent = await Student.findOne({
      $or: [
        { studentId },
        { email: studentEmail },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with this ID or email already exists",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: studentEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Default password
    const studentPassword = password || "Student@123";

    // Hash password
    const hashedPassword = await bcrypt.hash(
      studentPassword,
      10
    );

    // Create User
    const user = await User.create({
      name,
      email: studentEmail,
      password: hashedPassword,
      role: "student",
    });

    try {
      // Create Student
      const student = await Student.create({
        studentId,
        name,
        email: studentEmail,
        class: studentClass,
        section,
        phone,
        address,
        userId: user._id,
      });

      res.status(201).json({
        message: "Student and login account created successfully",

        student: {
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          class: student.class,
          section: student.section,
          phone: student.phone,
          address: student.address,
          userId: student.userId,
        },

        loginDetails: {
          email: user.email,
          password: studentPassword,
        },
      });
    } catch (studentError) {
      await User.findByIdAndDelete(user._id);
      throw studentError;
    }
  } catch (error) {
    console.error("Create Student Error:", error);

    res.status(500).json({
      message: "Failed to create student",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL STUDENTS
// ======================================================

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
    console.error("Get Students Error:", error);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE STUDENT
// ======================================================

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("userId", "name email role");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      student,
    });
  } catch (error) {
    console.error("Get Student Error:", error);

    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};


// ======================================================
// UPDATE STUDENT + PASSWORD
// ======================================================

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
      email,
      class: studentClass,
      section,
      phone,
      address,
      password,
    } = req.body;

    // ==================================================
    // UPDATE STUDENT ID
    // ==================================================

    if (studentId && studentId !== student.studentId) {
      const existingStudentId = await Student.findOne({
        studentId,
        _id: { $ne: student._id },
      });

      if (existingStudentId) {
        return res.status(400).json({
          message: "Student ID already exists",
        });
      }

      student.studentId = studentId;
    }

    // ==================================================
    // UPDATE EMAIL
    // ==================================================

    if (
      email &&
      email.toLowerCase().trim() !== student.email
    ) {
      const newEmail = email.toLowerCase().trim();

      // Check Student email
      const existingStudentEmail =
        await Student.findOne({
          email: newEmail,
          _id: { $ne: student._id },
        });

      if (existingStudentEmail) {
        return res.status(400).json({
          message:
            "Email already belongs to another student",
        });
      }

      // Check User email
      const existingUser = await User.findOne({
        email: newEmail,
        _id: { $ne: student.userId },
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            "Email already belongs to another user",
        });
      }

      student.email = newEmail;

      // Update login email
      if (student.userId) {
        await User.findByIdAndUpdate(
          student.userId,
          {
            email: newEmail,
          }
        );
      }
    }

    // ==================================================
    // UPDATE NAME
    // ==================================================

    if (name !== undefined && name.trim() !== "") {
      student.name = name.trim();

      // Update User name
      if (student.userId) {
        await User.findByIdAndUpdate(
          student.userId,
          {
            name: name.trim(),
          }
        );
      }
    }

    // ==================================================
    // UPDATE CLASS
    // ==================================================

    if (
      studentClass !== undefined &&
      studentClass.trim() !== ""
    ) {
      student.class = studentClass.trim();
    }

    // ==================================================
    // UPDATE SECTION
    // ==================================================

    if (section !== undefined) {
      student.section = section;
    }

    // ==================================================
    // UPDATE PHONE
    // ==================================================

    if (phone !== undefined) {
      student.phone = phone;
    }

    // ==================================================
    // UPDATE ADDRESS
    // ==================================================

    if (address !== undefined) {
      student.address = address;
    }

    // ==================================================
    // UPDATE PASSWORD
    // ==================================================

    if (
      password !== undefined &&
      password.trim() !== ""
    ) {
      // Minimum password length
      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      if (!student.userId) {
        return res.status(400).json({
          message:
            "Student login account not found",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      // Update User password
      await User.findByIdAndUpdate(
        student.userId,
        {
          password: hashedPassword,
        }
      );
    }

    // ==================================================
    // SAVE STUDENT
    // ==================================================

    const updatedStudent = await student.save();

    // ==================================================
    // GET UPDATED STUDENT
    // ==================================================

    const populatedStudent =
      await Student.findById(
        updatedStudent._id
      ).populate(
        "userId",
        "name email role"
      );

    res.status(200).json({
      message: "Student updated successfully",
      student: populatedStudent,
    });
  } catch (error) {
    console.error(
      "Update Student Error:",
      error
    );

    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
};


// ======================================================
// DELETE STUDENT + USER ACCOUNT
// ======================================================

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Delete student
    await Student.findByIdAndDelete(
      student._id
    );

    // Delete linked user account
    if (student.userId) {
      await User.findByIdAndDelete(
        student.userId
      );
    }

    res.status(200).json({
      message:
        "Student and user account deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Student Error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};