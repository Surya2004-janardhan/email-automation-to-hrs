const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

/**
 * Phase 3: Send emails in batches
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

  // Send ONE email BCC'd to all recipients in the batch
  const bccRecipients = batch.map((emailObj) => emailObj.email);

  // Keep all recipients (don't remove duplicates)
  const allRecipients = bccRecipients;

  console.log(
    `Sending to ${allRecipients.length} recipients (including duplicates)`
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    bcc: allRecipients, // BCC to all emails in batch
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
    sentEmails.push(...allRecipients); // All recipients are sent to
    console.log(`Batch email sent to ${allRecipients.length} recipients`);
  } catch (error) {
    console.error(`Failed to send batch email:`, error);
  }

  return sentEmails;
}

module.exports = { sendEmails };
