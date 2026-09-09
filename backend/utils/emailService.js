const nodemailer = require("nodemailer");

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT || 587) === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendReminderEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error(
      "Email service is not configured. Add EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM to your backend .env file.",
    );
  }

  if (!to) {
    throw new Error("Recipient email is required");
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = {
  sendReminderEmail,
};
