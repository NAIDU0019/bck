// pages/api/send-email.js
// This file runs on the server (as a serverless function) in Next.js

// Ensure you have nodemailer installed:
// npm install nodemailer
// or
// yarn add nodemailer

import nodemailer from "nodemailer";

// --- Helper Function ---
// For consistent price formatting in the email content
function formatPrice(amount) {
  // Ensure amount is a number and format to 2 decimal places with rupee symbol
  return `₹${parseFloat(amount).toFixed(2)}`;
}

// --- Nodemailer Transporter Setup ---
// This transporter is created once per instance of the serverless function.
// Environment variables (process.env.EMAIL_USER, process.env.EMAIL_PASS)
// must be set in your .env.local file (for local development)
// and in your deployment platform's environment variables (e.g., Vercel, Netlify).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your sender email (e.g., "yourstore@gmail.com")
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (NOT your regular password)
  },
});

// --- API Route Handler ---
export default async function handler(req, res) {
  // 1. Validate Request Method
  if (req.method !== "POST") {
    // Return 405 Method Not Allowed if the request is not POST
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 2. Destructure Request Body
  // Next.js automatically parses JSON body for API routes
  const {
    email,
    fullName,
    address,
    city,
    state,
    postalCode,
    phoneNumber,
    paymentMethod,
    orderDetails, // This object should contain `items` array and `total`
    orderId,      // The Supabase order ID passed from the frontend
  } = req.body;

  // 3. Basic Input Validation
  // Ensure all critical fields are present before proceeding
  if (!email || !fullName || !address || !city || !state || !postalCode || !phoneNumber || !orderDetails || !orderDetails.items || !orderDetails.total) {
    console.error("Missing required fields in email request body:", req.body);
    return res.status(400).json({ error: "Missing required order details." });
  }

  // 4. Debugging Logs (will appear in your Next.js dev server console or deployment logs)
  console.log(`Received email request for order ID: ${orderId || 'N/A'} for ${email}`);
  console.log("Order total:", orderDetails.total);

  // 5. Generate HTML for Order Items (used in both emails)
  const itemsHtml = orderDetails.items
    .map((item, index) => {
      // Safely access product details and calculate item total
      const productName = item.product?.name || "Product Name N/A";
      const weight = item.weight || "N/A";
      const quantity = item.quantity || 0;
      const pricePerUnit = item.product?.pricePerWeight?.[weight] || 0;
      const itemTotal = pricePerUnit * quantity;

      return `
        <li style="margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 8px;">
            <div style="font-weight: bold; color: #333;">${productName} (${weight}g)</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.95em; color: #555;">
                <span>Quantity: ${quantity}</span>
                <span>Price: ${formatPrice(itemTotal)}</span>
            </div>
        </li>`;
    })
    .join("");

  // 6. Define HTML Content for Store Email
  const storeHtmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">New Order from ${fullName} (${email})</h2>
        <p style="font-size: 1.1em;"><strong>Order ID:</strong> ${orderId || 'N/A'}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>

        <h3 style="color: #34495e; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px;">Customer Details</h3>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>Shipping Address:</strong> ${address}, ${city}, ${state} - ${postalCode}</p>
        <p><strong>Payment Method:</strong> ${
          paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Razorpay (Online Payment)"
        }</p>

        <h3 style="color: #34495e; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px;">Order Summary</h3>
        <ul style="list-style: none; padding: 0;">
            ${itemsHtml}
        </ul>
        <hr style="border: none; border-top: 2px solid #34495e; margin: 20px 0;" />
        <p style="font-weight: bold; font-size: 1.3em; text-align: right; color: #2c3e50;">
            <strong>Total Amount:</strong> ${formatPrice(orderDetails.total)}
        </p>
        <p style="margin-top: 30px; font-size: 0.9em; color: #7f8c8d;">
            This email was sent from your e-commerce system.
        </p>
    </div>
  `;

  // 7. Define HTML Content for Customer Email (more styled for a better user experience)
  const customerHtmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e2e2; border-radius: 8px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #d35400; margin: 0; font-size: 28px;">ADHYAA PICKLES</h1>
        <p style="font-size: 14px; color: #777;">Authentic Indian Pickles</p>
      </div>

      <h2 style="color: #d35400; text-align: center; font-size: 24px; margin-bottom: 20px;">Thank you for your order, ${fullName}!</h2>
      <p style="font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        We’re excited to let you know that your order has been received and is now being processed.
      </p>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; border: 1px solid #eee; margin-top: 20px;">
        <h3 style="border-bottom: 2px solid #d35400; padding-bottom: 8px; margin-top: 0; font-size: 18px; color: #333;">Order Details</h3>
        <p style="font-size: 15px; margin-bottom: 15px;"><strong>Order ID:</strong> #${orderId || 'N/A'}</p>
        <ul style="list-style: none; padding: 0;">
          ${itemsHtml}
        </ul>
        <p style="font-weight: bold; font-size: 20px; margin-top: 25px; text-align: right; color: #d35400;">
          Total Amount: ${formatPrice(orderDetails.total)}
        </p>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; border: 1px solid #eee; margin-top: 20px;">
        <h3 style="border-bottom: 2px solid #d35400; padding-bottom: 8px; margin-top: 0; font-size: 18px; color: #333;">Shipping Information</h3>
        <p style="font-size: 15px; margin-bottom: 5px;"><strong>Shipping Address:</strong></p>
        <p style="font-size: 15px; line-height: 1.4; text-transform: capitalize;">
          ${address}<br/>
          ${city}, ${state} - ${postalCode}
        </p>
        <p style="font-size: 15px; margin-top: 10px;"><strong>Phone:</strong> ${phoneNumber}</p>
        <p style="font-size: 15px;"><strong>Payment Method:</strong> ${
          paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online Payment (Razorpay)"
        }</p>
      </div>

      <p style="margin-top: 35px; font-size: 16px; text-align: center; color: #555;">
        We will send another update once your order has been shipped.
      </p>
      <p style="font-size: 16px; text-align: center; color: #555;">
        If you have any questions, feel free to reply to this email or call us anytime at <strong>+91 7995059659</strong>.
      </p>

      <p style="margin-top: 40px; font-style: italic; color: #7f8c8d; text-align: center;">
        Warm regards,<br />
        <strong>The ADHYAA PICKLES Team</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin-top: 40px;" />

      <p style="font-size: 11px; color: #aaa; text-align: center;">
        You’re receiving this email because you placed an order at ADHYAA PICKLES. If you believe this is a mistake, please contact us immediately.
      </p>
    </div>
  `;

  // 8. Send Emails using Nodemailer
  try {
    // Send email to the store (your business email)
    await transporter.sendMail({
      from: `"ADHYAA PICKLES" <${process.env.EMAIL_USER}>`, // Your verified sender email
      to: process.env.STORE_EMAIL_RECIPIENT, // This should also be an env variable
      subject: `New Order from ${fullName} - Order #${orderId || 'N/A'} - Total: ${formatPrice(orderDetails.total)}`,
      html: storeHtmlContent,
    });
    console.log("Email sent to store successfully.");

    // Send confirmation email to the customer
    await transporter.sendMail({
      from: `"ADHYAA PICKLES" <${process.env.EMAIL_USER}>`,
      to: email, // Customer's email
      subject: `Your ADHYAA PICKLES Order Confirmation #${orderId || 'N/A'}`,
      html: customerHtmlContent,
    });
    console.log(`Confirmation email sent to customer: ${email}`);

    // 9. Respond with Success
    return res.status(200).json({ message: "Emails sent successfully" });

  } catch (error: any) { // Use 'any' for error type if not strictly typed
    // 10. Handle and Respond with Error
    console.error("Failed to send emails:", error);
    // Send a more informative error message back to the frontend for debugging
    return res.status(500).json({
      error: "Failed to send confirmation emails.",
      details: error.message || "An unknown error occurred.",
    });
  }
}