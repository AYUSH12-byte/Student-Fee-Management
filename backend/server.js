const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { autoSendDueReminders } = require("./controllers/reminderController");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/student-fees", require("./routes/studentFeeRoutes"));
app.use("/api/receipts", require("./routes/receiptRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reminders", require("./routes/reminderRoutes"));
app.use("/api/student-portal", require("./routes/studentPortalRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
// app.use("/api/test", require("./routes/testRoutes"));

// Test routes
app.get("/", (req, res) => {
  res.json({
    message: "Student Fee Management API is running",
  });
});

const PORT = process.env.PORT || 7000;

setInterval(
  () => {
    autoSendDueReminders();
  },
  60 * 60 * 1000,
);

autoSendDueReminders();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
