// ✅ File: backend/routes/phonepeWebhook.js

const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

module.exports = (supabase) => {
  const router = express.Router();

  router.post("/", async (req, res) => {
    try {
      const body = JSON.parse(req.body);
      const { code, data } = body;

      console.log("📦 PhonePe Webhook Received:", body);

      if (code !== "PAYMENT_SUCCESS") {
        console.warn("❌ Payment not successful. Ignoring.");
        return res.status(400).send("Ignored non-success payment.");
      }

      const transactionStatus = data?.status;
      const orderId = data?.merchantOrderId;

      if (!orderId || transactionStatus !== "SUCCESS") {
        return res.status(400).json({ message: "Invalid or incomplete webhook data" });
      }

      // Fetch temp order payload stored before redirect (optional optimization)
      const { data: tempData, error: tempError } = await supabase
        .from("temp_orders")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (tempError || !tempData) {
        console.error("🚨 Could not fetch temp order data:", tempError);
        return res.status(404).json({ message: "Temp order not found" });
      }

      // Now insert into main orders table
      const orderPayload = {
        orderId,
        customerInfo: tempData.customer_info,
        orderedItems: tempData.ordered_items,
        totalAmount: tempData.total_amount,
        paymentMethod: "phonepe",
        paymentId: data.transactionId,
        orderDetails: {
          subtotal: tempData.subtotal,
          discountAmount: tempData.discount_amount,
          shippingCost: tempData.shipping_cost,
          taxes: tempData.taxes,
          additionalFees: tempData.additional_fees,
        },
        appliedCoupon: tempData.applied_coupon,
      };

      const backendOrderPostUrl = `${process.env.BACKEND_URL}/api/orders`;
      const headers = {
        "Content-Type": "application/json",
        "X-Applied-Coupon": tempData.applied_coupon?.code || ""
      };

      const placeOrder = await axios.post(backendOrderPostUrl, orderPayload, { headers });
      console.log("✅ Order finalized and saved via /api/orders", placeOrder.data);

      // Cleanup temp order if needed
      await supabase.from("temp_orders").delete().eq("order_id", orderId);

      return res.status(200).send("Payment Success. Order saved.");
    } catch (err) {
      console.error("❌ Error handling PhonePe webhook:", err);
      return res.status(500).json({ message: "Internal server error", error: err.message });
    }
  });

  return router;
};
