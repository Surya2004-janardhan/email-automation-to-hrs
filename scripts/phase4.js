const ExcelJS = require("exceljs");

/**
 * Phase 4: Update sent status in XLSX file
 */
async function updateSentStatus(
  filePath,
  sentEmails,
  editPassword,
  openPassword
) {
  try {
    const workbook = new ExcelJS.Workbook();

    // Try to read with password - use editPassword if available, otherwise openPassword
    const readPassword =
      editPassword && editPassword.trim() !== "" ? editPassword : openPassword;

    if (readPassword && readPassword.trim() !== "") {
      try {
        await workbook.xlsx.readFile(filePath, { password: readPassword });
        console.log("Successfully opened Excel file for editing with password");
      } catch (passwordError) {
        console.log(
          "Password read failed for editing, trying without password..."
        );
        await workbook.xlsx.readFile(filePath);
        console.log(
          "Successfully opened Excel file for editing without password"
        );
      }
    } else {
      await workbook.xlsx.readFile(filePath);
      console.log("Successfully opened Excel file for editing (no password)");
    }

    const worksheet = workbook.getWorksheet(1); // First worksheet
    if (!worksheet) {
      throw new Error("No worksheets found in the Excel file");
    }

    let updatedCount = 0;

    // Find and update sent_status for sent emails
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header row
        const emailCell = row.getCell(1); // Assuming email is in column 1
        const statusCell = row.getCell(2); // Assuming sent_status is in column 2

        if (
          emailCell &&
          emailCell.value &&
          sentEmails.includes(emailCell.value)
        ) {
          statusCell.value = "email sent";
          updatedCount++;
        }
      }
    });

    // Save back to file with password protection if provided
    if (editPassword && editPassword.trim() !== "") {
      await workbook.xlsx.writeFile(filePath, { password: editPassword });
      console.log("Successfully saved Excel file with password protection");
    } else {
      await workbook.xlsx.writeFile(filePath);
      console.log("Successfully saved Excel file");
    }

    console.log(`Updated sent status for ${updatedCount} emails`);
  } catch (error) {
    console.error("❌ Failed to update the Excel file:", error.message);
    console.error(
      "Make sure the file is not open in Excel and the path is correct"
    );
    throw error;
  }
}

module.exports = { updateSentStatus };
