require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP config once server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP connected successfully");
  }
});

app.post("/api/send-order-email", async (req, res) => {
  try {
    const order = req.body;

    if (!order.email) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    // Compose email content
    const orderText = `
Order Details:

Name: ${order.fullName}
Email: ${order.email}
Phone: ${order.phoneNumber}
Address: ${order.address}, ${order.city}, ${order.state}, ${order.postalCode}
Payment Method: ${order.paymentMethod}

Items:
${order.items
  .map(
    (item) =>
      `- ${item.product.name} | Weight: ${item.weight}g | Qty: ${item.quantity} | Price: ₹${(
        item.product.pricePerWeight?.[item.weight] || 0
      ).toFixed(2)}`
  )
  .join("\n")}

Total Amount: ₹${order.total.toFixed(2)}
Order Date: ${new Date(order.date).toLocaleString()}
`;

    // Email to admin
    const adminMailOptions = {
      from: `"Adhyaa Pickles" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order from ${order.fullName}`,
      text: orderText,
    };

    // Email to customer
    const customerMailOptions = {
      from: `"Adhyaa Pickles" <${process.env.SMTP_USER}>`,
      to: order.email,
      subject: "Your Adhyaa Pickles Order Confirmation",
      text: `Dear ${order.fullName},\n\nThank you for your order! Here are the details:\n\n${orderText}\n\nWe will process your order soon.\n\nRegards,\nAdhyaa Pickles Team`,
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions),
    ]);

    res.json({ message: "Emails sent successfully" });
  } catch (err) {
    console.error("Error sending emails:", err);
    res.status(500).json({ error: "Failed to send emails" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
