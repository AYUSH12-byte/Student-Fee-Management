const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");

const PDFDocument = require("pdfkit");
const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");

// Generate unique receipt number
const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Receipt.countDocuments();

  const number = String(count + 1).padStart(5, "0");

  return `REC-${year}-${number}`;
};

// CREATE RECEIPT
const createReceipt = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: "Payment ID is required",
      });
    }

    // Check payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Check existing receipt
    const existingReceipt = await Receipt.findOne({
      paymentId,
    });

    if (existingReceipt) {
      return res.status(400).json({
        message: "Receipt already exists for this payment",
        receipt: existingReceipt,
      });
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Create receipt
    const receipt = await Receipt.create({
      paymentId,
      receiptNumber,
    });

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate({
        path: "paymentId",
        populate: {
          path: "studentFeeId",
          populate: [
            {
              path: "studentId",
            },
            {
              path: "feeStructureId",
            },
          ],
        },
      });

    res.status(201).json({
      message: "Receipt generated successfully",
      receipt: populatedReceipt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate receipt",
      error: error.message,
    });
  }
};

// GET ALL RECEIPTS
const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find()
      .populate({
        path: "paymentId",
        populate: {
          path: "studentFeeId",
          populate: {
            path: "studentId",
          },
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: receipts.length,
      receipts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipts",
      error: error.message,
    });
  }
};

// GET SINGLE RECEIPT
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate({
        path: "paymentId",
        populate: {
          path: "studentFeeId",
          populate: [
            {
              path: "studentId",
            },
            {
              path: "feeStructureId",
            },
          ],
        },
      });

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found",
      });
    }

    res.status(200).json({
      receipt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message,
    });
  }
};

// GET RECEIPT BY PAYMENT
const getReceiptByPayment = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({
      paymentId: req.params.paymentId,
    }).populate({
      path: "paymentId",
      populate: {
        path: "studentFeeId",
        populate: [
          {
            path: "studentId",
          },
          {
            path: "feeStructureId",
          },
        ],
      },
    });

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found for this payment",
      });
    }

    res.status(200).json({
      receipt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message,
    });
  }
};

// ======================================================
// DOWNLOAD RECEIPT AS PDF
// ======================================================

const downloadReceiptPDF = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate({
        path: "paymentId",
        populate: {
          path: "studentFeeId",
          populate: [
            {
              path: "studentId",
            },
            {
              path: "feeStructureId",
            },
          ],
        },
      });

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found",
      });
    }

    const payment = receipt.paymentId;
    const studentFee = payment.studentFeeId;
    const student = studentFee.studentId;
    const feeStructure = studentFee.feeStructureId;

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${receipt.receiptNumber}.pdf`
    );

    // Send PDF directly to browser
    doc.pipe(res);

    // ==================================================
    // HEADER
    // ==================================================

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("STUDENT FEE MANAGEMENT SYSTEM", {
        align: "center",
      });

    doc.moveDown(0.5);

    doc
      .fontSize(18)
      .text("PAYMENT RECEIPT", {
        align: "center",
      });

    doc.moveDown();

    // Horizontal line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown();

    // ==================================================
    // RECEIPT INFORMATION
    // ==================================================

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Receipt Number:");

    doc
      .font("Helvetica")
      .text(receipt.receiptNumber);

    doc.moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Payment Date:");

    doc
      .font("Helvetica")
      .text(
        new Date(payment.paymentDate).toLocaleDateString()
      );

    doc.moveDown();

    // ==================================================
    // STUDENT INFORMATION
    // ==================================================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Student Information");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Student ID: ${student.studentId || "N/A"}`)
      .text(`Name: ${student.name || "N/A"}`)
      .text(`Class: ${student.class || "N/A"}`)
      .text(`Section: ${student.section || "N/A"}`)
      .text(`Email: ${student.email || "N/A"}`);

    doc.moveDown();

    // ==================================================
    // FEE INFORMATION
    // ==================================================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Fee Information");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Fee Structure: ${feeStructure?.name || "N/A"}`
      )
      .text(
        `Tuition Fee: Rs. ${feeStructure?.tuitionFee || 0}`
      )
      .text(
        `Transport Fee: Rs. ${feeStructure?.transportFee || 0}`
      )
      .text(
        `Exam Fee: Rs. ${feeStructure?.examFee || 0}`
      );

    doc.moveDown();

    // ==================================================
    // PAYMENT INFORMATION
    // ==================================================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Payment Information");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Payment Method: ${payment.paymentMethod}`
      )
      .text(
        `Transaction Number: ${
          payment.transactionNumber || "N/A"
        }`
      )
      .text(
        `Amount Paid: Rs. ${payment.amount}`
      );

    doc.moveDown();

    // ==================================================
    // FEE SUMMARY
    // ==================================================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Fee Summary");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Total Fee: Rs. ${studentFee.totalAmount}`
      )
      .text(
        `Total Paid: Rs. ${studentFee.paidAmount}`
      )
      .text(
        `Remaining Due: Rs. ${studentFee.dueAmount}`
      )
      .text(
        `Status: ${studentFee.status}`
      );

    doc.moveDown(2);

    // ==================================================
    // FOOTER
    // ==================================================

    doc
      .fontSize(11)
      .text(
        "This is a computer-generated receipt.",
        {
          align: "center",
        }
      );

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .text(
        "Thank you for your payment.",
        {
          align: "center",
        }
      );

    // Finish PDF
    doc.end();

  } catch (error) {
    console.error(
      "Download Receipt PDF Error:",
      error
    );

    res.status(500).json({
      message: "Failed to generate receipt PDF",
      error: error.message,
    });
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
  downloadReceiptPDF,
};