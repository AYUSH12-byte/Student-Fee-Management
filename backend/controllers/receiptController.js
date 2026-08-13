const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");
const PDFDocument = require("pdfkit");

// GENERATE UNIQUE RECEIPT NUMBER

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

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Check if receipt already exists
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

// GET ALL RECEIPTS

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

// GET SINGLE RECEIPT

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
    console.error("Get Receipt By Payment Error:", error);

    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message,
    });
  }
};

// DOWNLOAD RECEIPT PDF

const downloadReceiptPDF = async (req, res) => {
  try {
    // GET RECEIPT

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

    // DATA

    const payment = receipt.paymentId;
    const studentFee = payment.studentFeeId;
    const student = studentFee.studentId;
    const feeStructure = studentFee.feeStructureId;

    // PDF SETUP

    const doc = new PDFDocument({
      size: "A4",
      margin: 35,
      autoFirstPage: true,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${receipt.receiptNumber}.pdf"`,
    );

    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const left = 35;
    const right = pageWidth - 35;
    const width = right - left;

    // HELPER FUNCTIONS

    const drawBox = (x, y, w, h) => {
      doc.rect(x, y, w, h).lineWidth(0.8).stroke();
    };

    const drawLine = (x1, y1, x2, y2) => {
      doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(0.7).stroke();
    };

    const sectionTitle = (title, y) => {
      doc.font("Helvetica-Bold").fontSize(11).text(title, left, y);

      return y + 18;
    };

    const labelValue = (label, value, x, y, labelWidth = 90) => {
      doc.font("Helvetica-Bold").fontSize(9).text(label, x, y, {
        width: labelWidth,
      });

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(value || "N/A", x + labelWidth, y);
    };

    // OUTER BORDER

    drawBox(20, 20, pageWidth - 40, pageHeight - 40);

    // SCHOOL HEADER

    doc
      .font("Helvetica-Bold")
      .fontSize(19)
      .text("STUDENT FEE MANAGEMENT SYSTEM", left, 42, {
        width,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .text("SCHOOL FEE COLLECTION RECEIPT", left, 68, {
        width,
        align: "center",
      });

    drawLine(left, 88, right, 88);

    // RECEIPT INFORMATION

    let y = 100;

    drawBox(left, y, width, 48);

    labelValue("Receipt No:", receipt.receiptNumber, left + 10, y + 10, 75);

    labelValue(
      "Payment Date:",
      new Date(payment.paymentDate).toLocaleDateString(),
      310,
      y + 10,
      80,
    );

    labelValue(
      "Payment Method:",
      payment.paymentMethod || "Cash",
      left + 10,
      y + 30,
      90,
    );

    labelValue(
      "Transaction No:",
      payment.transactionNumber || "N/A",
      310,
      y + 30,
      85,
    );

    y += 62;

    // STUDENT INFORMATION

    y = sectionTitle("STUDENT INFORMATION", y);

    drawBox(left, y, width, 72);

    labelValue(
      "Student ID:",
      student?.studentId || "N/A",
      left + 10,
      y + 12,
      75,
    );

    labelValue("Student Name:", student?.name || "N/A", 310, y + 12, 80);

    labelValue("Class:", student?.class || "N/A", left + 10, y + 35, 75);

    labelValue("Section:", student?.section || "N/A", 310, y + 35, 80);

    labelValue("Email:", student?.email || "N/A", left + 10, y + 56, 75);

    y += 86;

    // FEE DETAILS

    y = sectionTitle("FEE DETAILS", y);

    const feeTableY = y;

    // Table height
    const feeTableHeight = 112;

    drawBox(left, feeTableY, width, feeTableHeight);

    // Column positions
    const col1 = left;
    const col2 = 355;
    const col3 = right;

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("FEE DESCRIPTION", col1 + 10, feeTableY + 9);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("AMOUNT (Rs.)", col2 + 10, feeTableY + 9);

    drawLine(col1, feeTableY + 27, col3, feeTableY + 27);

    // Tuition
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Tuition Fee", col1 + 10, feeTableY + 38);

    doc.text(
      Number(feeStructure?.tuitionFee || 0).toFixed(2),
      col2 + 10,
      feeTableY + 38,
    );

    // Transport
    doc.text("Transport Fee", col1 + 10, feeTableY + 56);

    doc.text(
      Number(feeStructure?.transportFee || 0).toFixed(2),
      col2 + 10,
      feeTableY + 56,
    );

    // Examination
    doc.text("Examination Fee", col1 + 10, feeTableY + 74);

    doc.text(
      Number(feeStructure?.examFee || 0).toFixed(2),
      col2 + 10,
      feeTableY + 74,
    );

    // Total
    drawLine(col1, feeTableY + 92, col3, feeTableY + 92);

    doc.font("Helvetica-Bold").text("TOTAL FEE", col1 + 10, feeTableY + 98);

    doc
      .font("Helvetica-Bold")
      .text(
        `Rs. ${Number(studentFee.totalAmount || 0).toFixed(2)}`,
        col2 + 10,
        feeTableY + 98,
      );

    y = feeTableY + feeTableHeight + 18;

    // PAYMENT DETAILS

    y = sectionTitle("PAYMENT DETAILS", y);

    const paymentBoxY = y;

    drawBox(left, paymentBoxY, width, 65);

    labelValue(
      "Amount Paid:",
      `Rs. ${Number(payment.amount || 0).toFixed(2)}`,
      left + 10,
      paymentBoxY + 12,
      80,
    );

    labelValue(
      "Payment Method:",
      payment.paymentMethod || "Cash",
      310,
      paymentBoxY + 12,
      90,
    );

    labelValue(
      "Transaction No:",
      payment.transactionNumber || "N/A",
      left + 10,
      paymentBoxY + 38,
      90,
    );

    labelValue("Remarks:", payment.remarks || "N/A", 310, paymentBoxY + 38, 55);

    y = paymentBoxY + 80;

    // FEE SUMMARY

    y = sectionTitle("FEE SUMMARY", y);

    const summaryY = y;

    drawBox(left, summaryY, width, 78);

    // Row 1
    labelValue(
      "Total Fee:",
      `Rs. ${Number(studentFee.totalAmount || 0).toFixed(2)}`,
      left + 12,
      summaryY + 13,
      80,
    );

    labelValue(
      "Total Paid:",
      `Rs. ${Number(studentFee.paidAmount || 0).toFixed(2)}`,
      310,
      summaryY + 13,
      75,
    );

    // Row 2
    labelValue(
      "Remaining Due:",
      `Rs. ${Number(studentFee.dueAmount || 0).toFixed(2)}`,
      left + 12,
      summaryY + 42,
      90,
    );

    labelValue(
      "Status:",
      String(studentFee.status || "Pending").toUpperCase(),
      310,
      summaryY + 42,
      50,
    );

    y = summaryY + 95;

    // THANK YOU MESSAGE

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Thank you for your payment.", left, y, {
        width,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        "This is a computer-generated receipt and does not require a signature.",
        left,
        y + 17,
        {
          width,
          align: "center",
        },
      );

    // FOOTER

    doc
      .fontSize(7)
      .text(
        `Receipt generated on ${new Date().toLocaleString()}`,
        left,
        pageHeight - 52,
        {
          width,
          align: "center",
        },
      );

    // FINISH PDF

    doc.end();
  } catch (error) {
    console.error("Download Receipt PDF Error:", error);

    // Only send JSON if headers haven't already been sent
    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to generate receipt PDF",
        error: error.message,
      });
    }
  }
};

// EXPORT

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  getReceiptByPayment,
  downloadReceiptPDF,
};
