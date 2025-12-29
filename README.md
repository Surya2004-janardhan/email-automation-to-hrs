# HR Email Sender

This project is designed to send batch emails to a list of HR contacts from an XLSX file. It processes emails in batches of 50, sending BCC emails with a resume attachment, and updates the sent status in the XLSX file.

## Features

- Modularized JavaScript code with async/sync functions
- Batch processing: 50 emails per batch
- BCC sending to avoid recipient visibility
- Resume attachment support
- XLSX file reading and updating
- SMTP configuration for reliable sending

## Setup

1. Install dependencies: `npm install`
2. Place your XLSX file as `data.xlsx` in the root directory (must have 'email' and 'sent_status' columns)
3. Place your resume as `resume.pdf` in the root directory
4. Copy `.env.example` to `.env` and configure your email credentials and XLSX passwords
5. Update subject and body in `src/index.js` as needed

### SMTP Configuration

This project uses Gmail SMTP. To avoid security issues:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: Go to Google Account settings > Security > App passwords
3. Use your Gmail address as EMAIL_USER and the app password as EMAIL_PASS

### XLSX Passwords

If your `data.xlsx` file is password-protected (optional - you can remove passwords for simplicity):
- XLSX_OPEN_PASSWORD: Password to open/read the file
- XLSX_EDIT_PASSWORD: Password to edit/write to the file

**Note**: The app now uses ExcelJS library which has excellent support for password-protected files. You can remove passwords from your Excel file if preferred for easier use.

## Usage

Run the main script: `node src/index.js`

## Phases

1. **Load Data**: Read and filter unsent emails from XLSX
2. **Prepare Batches**: Group emails into batches of 50
3. **Send Emails**: Send BCC emails with attachment
4. **Update Data**: Mark sent emails in XLSX

## Dependencies

- xlsx: For Excel file handling
- nodemailer: For email sending
- dotenv: For environment variables