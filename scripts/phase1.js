const ExcelJS = require("exceljs");
const path = require("path");

/**
 * Phase 1: Load and filter unsent emails from XLSX file
 * @returns {Array} Array of unsent email objects
 */
async function loadUnsentEmails(filePath, openPassword, editPassword) {
  try {
    const workbook = new ExcelJS.Workbook();

    // Try to read with password first if provided
    if (openPassword && openPassword.trim() !== "") {
      try {
        await workbook.xlsx.readFile(filePath, { password: openPassword });
        console.log("Successfully opened password-protected Excel file");
      } catch (passwordError) {
        console.log("Password read failed, trying without password...");
        // If password fails, try without password
        await workbook.xlsx.readFile(filePath);
        console.log("Successfully opened Excel file without password");
      }
    } else {
      // No password provided, read normally
      await workbook.xlsx.readFile(filePath);
      console.log("Successfully opened Excel file (no password)");
    }

    const worksheet = workbook.getWorksheet(1); // First worksheet
    if (!worksheet) {
      throw new Error("No worksheets found in the Excel file");
    }

    const data = [];

    // Convert worksheet to JSON
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header row
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getCell(1, colNumber);
          if (headerCell && headerCell.value) {
            rowData[headerCell.value] = cell.value;
          }
        });
        data.push(rowData);
      }
    });

    console.log(`Loaded ${data.length} rows from Excel file`);

    // Filter emails where sent_status is not 'email sent'
    const unsentEmails = data.filter((row) => row.sent_status !== "email sent");

    return unsentEmails;
  } catch (error) {
    console.error("❌ Failed to read the Excel file. Possible issues:");
    console.error("1. File is corrupted or not a valid .xlsx file");
    console.error("2. File is currently open in Excel");
    console.error("3. Wrong file format (should be .xlsx, not .xls)");
    console.error("4. File path is incorrect");
    console.error("5. File doesn't exist");
    console.error("6. Password is incorrect (if file is password-protected)");
    console.error("\nPlease check your data.xlsx file and try again.");
    console.error("Error details:", error.message);
    throw error;
  }
}

module.exports = { loadUnsentEmails };
