const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

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
// app.use("/api/test", require("./routes/testRoutes"));

// Test routes
app.get("/", (req, res) => {
  res.json({
    message: "Student Fee Management API is running",
  });
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});