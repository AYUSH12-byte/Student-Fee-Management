const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");
const PDFDocument = require("pdfkit");

// ======================================================
// GENERATE UNIQUE RECEIPT NUMBER
// ======================================================

const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Receipt.countDocuments();

  const number = String(count + 1).padStart(5, "0");

  return `REC-${year}-${number}`;
};

// ======================================================
// CREATE RECEIPT
// ======================================================

const createReceipt = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: "Payment ID is required",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const existingReceipt = await Receipt.findOne({
      paymentId,
    });

    if (existingReceipt) {
      return res.status(400).json({
        message: "Receipt already exists for this payment",
        receipt: existingReceipt,
      });
    }

    const receiptNumber = await generateReceiptNumber();

    const receipt = await Receipt.create({
      paymentId,
      receiptNumber,
    });

    const populatedReceipt = await Receipt.findById(receipt._id).populate({
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
    console.error("Create Receipt Error:", error);

    res.status(500).json({
      message: "Failed to generate receipt",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL RECEIPTS
// ======================================================

const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find()
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
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: receipts.length,
      receipts,
    });
  } catch (error) {
    console.error("Get Receipts Error:", error);

    res.status(500).json({
      message: "Failed to fetch receipts",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE RECEIPT
// ======================================================

const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate({
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
    console.error("Get Receipt Error:", error);

    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message,
    });
  }
};

// ======================================================
// GET RECEIPT BY PAYMENT
// ======================================================

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
    console.error("Get Receipt By Payment Error:", error);

    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message,
    });
  }
};

// ======================================================
// DOWNLOAD PROFESSIONAL SCHOOL RECEIPT PDF
// ======================================================

const downloadReceiptPDF = async (req, res) => {
  try {
    // --------------------------------------------------
    // GET RECEIPT
    // --------------------------------------------------

    const receipt = await Receipt.findById(req.params.id).populate({
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

    // --------------------------------------------------
    // DATA
    // --------------------------------------------------

    const payment = receipt.paymentId;
    const studentFee = payment?.studentFeeId;
    const student = studentFee?.studentId;
    const feeStructure = studentFee?.feeStructureId;

    // --------------------------------------------------
    // PDF SETUP
    // --------------------------------------------------

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      autoFirstPage: true,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${receipt.receiptNumber}.pdf"`,
    );

    doc.pipe(res);

    // A4 dimensions in points
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;

    const MARGIN = 30;

    const LEFT = MARGIN;
    const RIGHT = PAGE_WIDTH - MARGIN;
    const CONTENT_WIDTH = RIGHT - LEFT;

    // --------------------------------------------------
    // HELPER FUNCTIONS
    // --------------------------------------------------

    const money = (value) => {
      return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const dateFormat = (value) => {
      if (!value) return "N/A";

      return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const drawRect = (x, y, width, height, lineWidth = 0.8) => {
      doc.lineWidth(lineWidth).rect(x, y, width, height).stroke();
    };

    const drawLine = (x1, y1, x2, y2, lineWidth = 0.8) => {
      doc.lineWidth(lineWidth).moveTo(x1, y1).lineTo(x2, y2).stroke();
    };

    const sectionHeader = (title, y) => {
      doc.font("Helvetica-Bold").fontSize(10).text(title, LEFT, y);

      drawLine(LEFT, y + 15, RIGHT, y + 15, 0.6);

      return y + 24;
    };

    const field = (label, value, x, y, labelWidth = 75, valueWidth = 190) => {
      doc.font("Helvetica-Bold").fontSize(8.5).text(label, x, y, {
        width: labelWidth,
      });

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .text(value || "N/A", x + labelWidth, y, {
          width: valueWidth,
        });
    };

    // --------------------------------------------------
    // OUTER BORDER
    // --------------------------------------------------

    drawRect(18, 18, PAGE_WIDTH - 36, PAGE_HEIGHT - 36, 1.2);

    // --------------------------------------------------
    // SCHOOL HEADER
    // --------------------------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("STUDENT FEE MANAGEMENT SYSTEM", LEFT, 38, {
        width: CONTENT_WIDTH,
        align: "center",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("SCHOOL / EDUCATIONAL INSTITUTION", LEFT, 64, {
        width: CONTENT_WIDTH,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Address, Nepal  |  Phone: +977-XXXXXXXXXX  |  Email: school@example.com",
        LEFT,
        80,
        {
          width: CONTENT_WIDTH,
          align: "center",
        },
      );

    // --------------------------------------------------
    // RECEIPT TITLE
    // --------------------------------------------------

    drawLine(LEFT, 98, RIGHT, 98, 1);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("OFFICIAL FEE PAYMENT RECEIPT", LEFT, 108, {
        width: CONTENT_WIDTH,
        align: "center",
      });

    doc.font("Helvetica").fontSize(7.5).text("Original Receipt", LEFT, 126, {
      width: CONTENT_WIDTH,
      align: "center",
    });

    // --------------------------------------------------
    // RECEIPT META
    // --------------------------------------------------

    const metaY = 143;
    const metaH = 52;

    drawRect(LEFT, metaY, CONTENT_WIDTH, metaH);

    field("Receipt No:", receipt.receiptNumber, LEFT + 10, metaY + 10, 68, 150);

    field(
      "Payment Date:",
      dateFormat(payment?.paymentDate),
      320,
      metaY + 10,
      75,
      150,
    );

    field(
      "Payment Method:",
      payment?.paymentMethod || "Cash",
      LEFT + 10,
      metaY + 31,
      85,
      150,
    );

    field(
      "Transaction No:",
      payment?.transactionNumber || "N/A",
      320,
      metaY + 31,
      85,
      150,
    );

    // --------------------------------------------------
    // STUDENT INFORMATION
    // --------------------------------------------------

    let y = 213;

    y = sectionHeader("STUDENT INFORMATION", y);

    const studentBoxY = y;
    const studentBoxH = 78;

    drawRect(LEFT, studentBoxY, CONTENT_WIDTH, studentBoxH);

    field(
      "Student ID:",
      student?.studentId,
      LEFT + 10,
      studentBoxY + 12,
      70,
      180,
    );

    field("Student Name:", student?.name, 320, studentBoxY + 12, 75, 170);

    field("Class:", student?.class, LEFT + 10, studentBoxY + 34, 70, 180);

    field("Section:", student?.section, 320, studentBoxY + 34, 55, 170);

    field("Email:", student?.email, LEFT + 10, studentBoxY + 56, 70, 180);

    field("Phone:", student?.phone, 320, studentBoxY + 56, 55, 170);

    y = studentBoxY + studentBoxH + 18;

    // --------------------------------------------------
    // FEE DETAILS
    // --------------------------------------------------

    y = sectionHeader("FEE DETAILS", y);

    const tableY = y;
    const tableH = 132;

    drawRect(LEFT, tableY, CONTENT_WIDTH, tableH);

    // Column divider
    const amountX = 430;

    drawLine(amountX, tableY, amountX, tableY + tableH);

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text("FEE DESCRIPTION", LEFT + 12, tableY + 10);

    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text("AMOUNT (Rs.)", amountX + 12, tableY + 10);

    drawLine(LEFT, tableY + 28, RIGHT, tableY + 28);

    // Tuition
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Tuition Fee", LEFT + 12, tableY + 42);

    doc.text(
      Number(feeStructure?.tuitionFee || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),
      amountX + 12,
      tableY + 42,
    );

    // Transport
    doc.text("Transport Fee", LEFT + 12, tableY + 62);

    doc.text(
      Number(feeStructure?.transportFee || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),
      amountX + 12,
      tableY + 62,
    );

    // Exam
    doc.text("Examination Fee", LEFT + 12, tableY + 82);

    doc.text(
      Number(feeStructure?.examFee || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),
      amountX + 12,
      tableY + 82,
    );

    // Total
    drawLine(LEFT, tableY + 101, RIGHT, tableY + 101);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("TOTAL FEE", LEFT + 12, tableY + 111);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        Number(studentFee?.totalAmount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
        amountX + 12,
        tableY + 111,
      );

    y = tableY + tableH + 18;

    // --------------------------------------------------
    // PAYMENT DETAILS
    // --------------------------------------------------

    y = sectionHeader("PAYMENT DETAILS", y);

    const paymentBoxY = y;
    const paymentBoxH = 62;

    drawRect(LEFT, paymentBoxY, CONTENT_WIDTH, paymentBoxH);

    field(
      "Amount Paid:",
      money(payment?.amount),
      LEFT + 10,
      paymentBoxY + 12,
      75,
      180,
    );

    field(
      "Payment Method:",
      payment?.paymentMethod || "Cash",
      320,
      paymentBoxY + 12,
      85,
      160,
    );

    field(
      "Transaction No:",
      payment?.transactionNumber || "N/A",
      LEFT + 10,
      paymentBoxY + 36,
      85,
      180,
    );

    field(
      "Remarks:",
      payment?.remarks || "N/A",
      320,
      paymentBoxY + 36,
      55,
      160,
    );

    y = paymentBoxY + paymentBoxH + 18;

    // --------------------------------------------------
    // PAYMENT SUMMARY
    // --------------------------------------------------

    y = sectionHeader("PAYMENT SUMMARY", y);

    const summaryY = y;
    const summaryH = 74;

    drawRect(LEFT, summaryY, CONTENT_WIDTH, summaryH);

    field(
      "Total Fee:",
      money(studentFee?.totalAmount),
      LEFT + 12,
      summaryY + 12,
      65,
      180,
    );

    field(
      "Total Paid:",
      money(studentFee?.paidAmount),
      320,
      summaryY + 12,
      65,
      170,
    );

    field(
      "Remaining Due:",
      money(studentFee?.dueAmount),
      LEFT + 12,
      summaryY + 38,
      80,
      170,
    );

    // Status
    const status = String(studentFee?.status || "Pending").toUpperCase();

    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text("STATUS:", 320, summaryY + 38);

    const statusX = 375;
    const statusY = summaryY + 33;

    drawRect(statusX, statusY, 105, 18, 0.8);

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(status, statusX, statusY + 5, {
        width: 105,
        align: "center",
      });

    y = summaryY + summaryH + 18;

    // --------------------------------------------------
    // AMOUNT RECEIVED BOX
    // --------------------------------------------------

    drawRect(LEFT, y, CONTENT_WIDTH, 48, 1);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("AMOUNT RECEIVED", LEFT + 12, y + 8);

    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(money(payment?.amount), LEFT + 12, y + 22);

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .text("Thank you for your payment.", 370, y + 19, {
        width: 155,
        align: "right",
      });

    // --------------------------------------------------
    // SIGNATURE SECTION
    // --------------------------------------------------

    const signatureY = y + 67;

    drawLine(LEFT + 15, signatureY, LEFT + 150, signatureY, 0.7);

    drawLine(RIGHT - 150, signatureY, RIGHT - 15, signatureY, 0.7);

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .text("Student / Parent Signature", LEFT + 15, signatureY + 5, {
        width: 135,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .text("Authorized Signature", RIGHT - 150, signatureY + 5, {
        width: 135,
        align: "center",
      });

    // --------------------------------------------------
    // FOOTER
    // --------------------------------------------------

    drawLine(LEFT, PAGE_HEIGHT - 62, RIGHT, PAGE_HEIGHT - 62, 0.6);

    doc
      .font("Helvetica")
      .fontSize(7)
      .text(
        "This is a computer-generated receipt and does not require a stamp.",
        LEFT,
        PAGE_HEIGHT - 50,
        {
          width: CONTENT_WIDTH,
          align: "center",
        },
      );

    doc
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        `Generated on ${new Date().toLocaleString()}`,
        LEFT,
        PAGE_HEIGHT - 37,
        {
          width: CONTENT_WIDTH,
          align: "center",
        },
      );

    // --------------------------------------------------
    // FINISH
    // --------------------------------------------------

    doc.end();
  } catch (error) {
    console.error("Download Receipt PDF Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to generate receipt PDF",
        error: error.message,
      });
    }
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
  downloadReceiptPDF,
};
