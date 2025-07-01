// routes/phonepeWebhook.js
const express = require("express");
const {
  StandardCheckoutClient,
  Env,
} = require("pg-sdk-node");

module.exports = (supabase) => {
  const router = express.Router();

  // NOTE: express.raw() is required in your main app.js for this route
  router.post("/", async (req, res) => {
  try {
    const client = StandardCheckoutClient.getInstance(
      process.env.PHONEPE_CLIENT_ID,
      process.env.PHONEPE_CLIENT_SECRET,
      parseInt(process.env.PHONEPE_CLIENT_VERSION),
      process.env.PHONEPE_ENV === "PROD" ? Env.PRODUCTION : Env.SANDBOX
    );

    const callback = client.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      req.headers["x-verify"],
      req.body.toString()
    );

    const { type, payload } = callback;
    const orderId = payload.merchantOrderId;
    const paymentState = payload.state;

    console.log("📦 CALLBACK:", type, paymentState, orderId);

    if (type === "CHECKOUT_ORDER_COMPLETED" && paymentState === "COMPLETED") {
      // ✅ Insert into real `orders` table
      await supabase.from("orders").insert([
        {
          order_id: orderId,
          customer_info: payload.metaInfo.customerInfo,
          ordered_items: payload.metaInfo.orderedItems,
          subtotal: payload.metaInfo.orderDetails.subtotal,
          discount_amount: payload.metaInfo.orderDetails.discountAmount,
          taxes: payload.metaInfo.orderDetails.taxes,
          shipping_cost: payload.metaInfo.orderDetails.shippingCost,
          additional_fees: payload.metaInfo.orderDetails.additionalFees,
          total_amount: payload.metaInfo.orderDetails.finalTotal,
          payment_method: "phonepe",
          applied_coupon: payload.metaInfo.appliedCoupon,
          state: "COMPLETED"
        }
      ]);
    } else if (type === "CHECKOUT_ORDER_FAILED" || paymentState === "FAILED") {
      // ❌ Payment failed or canceled: log or store as needed
      console.warn("❌ Payment failed for order:", orderId);
      await supabase.from("orders").insert([
        {
          order_id: orderId,
          state: "FAILED",
          payment_method: "phonepe"
        }
      ]);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ PhonePe Callback Error:", err);
    res.sendStatus(500);
  }
});


  return router;
};
