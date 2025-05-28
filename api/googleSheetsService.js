// backend/googleSheetsService.js
import { google } from "googleapis";
import path from "path";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // Replace with your Google Sheet ID

// Load service account credentials
const credentialsPath = path.join(process.cwd(), "credentials.json");
const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

export async function appendOrder(orderData) {
  try {
    const values = [
      [
        orderData.orderId,
        orderData.customerName,
        orderData.email,
        orderData.phone,
        orderData.address,
        JSON.stringify(orderData.items), // stringified list of items with weight, quantity
        orderData.total,
        orderData.paymentMethod,
        orderData.paymentStatus,
        new Date().toISOString(),
      ],
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Orders!A:J", // Adjust sheet name & range accordingly
      valueInputOption: "USER_ENTERED",
      resource: {
        values,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error appending order to Google Sheets:", error);
    throw error;
  }
}
