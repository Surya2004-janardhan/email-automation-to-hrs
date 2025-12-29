const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

/**
 * Phase 3: Send emails in batches
 * @param {Array} batch - Array of email objects for this batch
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} resumePath - Path to resume file
 * @returns {Array} Array of sent email addresses
 */
async function sendEmails(batch, subject, body, resumePath) {
  // Configure transporter - Using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  });

  const sentEmails = [];

  for (const emailObj of batch) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: emailObj.email,
      subject: subject,
      text: body,
      attachments: [
        {
          filename: "resume.pdf",
          path: resumePath,
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      sentEmails.push(emailObj.email);
      console.log(`Email sent to: ${emailObj.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${emailObj.email}:`, error);
    }
  }

  return sentEmails;
}

module.exports = { sendEmails };
