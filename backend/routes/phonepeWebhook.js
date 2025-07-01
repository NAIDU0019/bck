// routes/phonepeWebhook.js
const express = require("express");
const crypto = require("crypto");

module.exports = (supabase) => {
  const router = express.Router();

  router.post("/", async (req, res) => {
    try {
      const rawBody = req.body.toString(); // Raw body from express.raw()
      const xVerify = req.headers["x-verify"];
      const [signature, saltIndex] = xVerify.split("###");

      const expectedSignature = crypto
        .createHash("sha256")
        .update(rawBody + process.env.PHONEPE_CLIENT_SECRET)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.warn("❌ Webhook X-VERIFY mismatch");
        return res.status(401).json({ message: "Invalid X-VERIFY" });
      }

      const payload = JSON.parse(rawBody);
      console.log("📦 PhonePe Callback Payload:", payload);

      // Extract transaction/order ID and status from payload
      const transactionId = payload.data?.merchantTransactionId || payload.data?.transactionId;
      const paymentStatus = payload.data?.status;

      if (!transactionId || !paymentStatus) {
        console.error("❌ Missing transactionId or paymentStatus in webhook payload");
        return res.status(400).json({ message: "Invalid payload data" });
      }

      // Map PhonePe payment status to order status
      let orderStatus;
      if (paymentStatus.toLowerCase() === "success") {
        orderStatus = "paid";
      } else if (paymentStatus.toLowerCase() === "failed") {
        orderStatus = "failed";
      } else {
        orderStatus = "pending";
      }

      // Update order status in Supabase
      const { data, error } = await supabase
        .from("orders")
        .update({ order_status: orderStatus })
        .eq("order_id", transactionId);

      if (error) {
        console.error("❌ Failed to update order status in DB:", error);
        return res.status(500).json({ message: "Failed to update order status" });
      }

      console.log(`✅ Order ${transactionId} status updated to ${orderStatus}`);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      console.error(err.stack);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  return router;
};
