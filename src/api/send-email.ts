// /api/send-order-emails.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { customerEmail, customerName, ownerEmail, orderItems, total } = req.body;

  console.log("📥 Received order email request:");
  console.log("Customer Email:", customerEmail);
  console.log("Customer Name:", customerName);
  console.log("Owner Email:", ownerEmail);
  console.log("Order Items:", orderItems);
  console.log("Total:", total);

  try {
    const emailBody = `
      <h2>Order Confirmation</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your order. Here's what you ordered:</p>
      <ul>
        ${orderItems.map(
          (item) =>
            `<li>${item.product.name} - ${item.quantity} × ${item.weight}g</li>`
        ).join('')}
      </ul>
      <p><strong>Total:</strong> ₹${total}</p>
    `;

    console.log("📤 Sending email to customer:", customerEmail);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: customerEmail,
      subject: 'Your ADHYAA PICKLES Order Confirmation',
      html: emailBody,
    });

    console.log("📤 Sending email to store owner:", ownerEmail || 'tech.adhyaapickles@gmail.com');
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ownerEmail || 'tech.adhyaapickles@gmail.com',
      subject: `New Order from ${customerName}`,
      html: emailBody,
    });

    console.log("✅ Emails sent successfully");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error sending emails:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
