const express = require('express');
const { StandardCheckoutClient, Env } = require('pg-sdk-node');

module.exports = (supabase) => {
  const router = express.Router();

  // Initialize PhonePe client
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || "1");
  const environment = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

  const phonepeClient = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, environment);

  // Webhook endpoint
  router.post('/', async (req, res) => {
    try {
      const username = process.env.PHONEPE_CALLBACK_USERNAME;
      const password = process.env.PHONEPE_CALLBACK_PASSWORD;
      const authorization = req.headers['authorization'];
      const responseBody = req.body.toString(); // raw body as string

      console.log("\n📩 Received PhonePe callback");
      console.log("Authorization:", authorization);
      console.log("Raw Body:", responseBody);

      // Step 1: Validate the callback
      const callbackResponse = phonepeClient.validateCallback(
        username,
        password,
        authorization,
        responseBody
      );

      const payload = callbackResponse.payload;
      const callbackType = callbackResponse.type;
      const state = payload.state;
      const orderId = payload.merchantOrderId;

      console.log(`✅ Validated callback for Order ID: ${orderId}, Type: ${callbackType}, State: ${state}`);

      // Step 2: Update order status in Supabase
      let newStatus = "pending";
      if (callbackType === "CHECKOUT_ORDER_COMPLETED" && state === "COMPLETED") {
        newStatus = "confirmed";
      } else if (callbackType === "CHECKOUT_ORDER_FAILED") {
        newStatus = "failed";
      } else {
        console.warn("⚠️ Unknown callback type or state:", callbackType, state);
      }

      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("order_id", orderId);

      if (error) {
        console.error("❌ Failed to update order status:", error.message);
        return res.status(500).json({ message: "Failed to update order status" });
      }

      console.log(`📦 Order ${orderId} updated to status: ${newStatus}`);
      return res.status(200).json({ message: "Callback handled successfully" });
    } catch (err) {
      console.error("❌ Error in PhonePe callback handler:", err.message);
      return res.status(500).json({ message: "Callback processing failed" });
    }
  });

  return router;
};
