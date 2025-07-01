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
    const authorizationHeader = req.headers["authorization"];
    const rawBody = req.body.toString(); // because express.raw() is used
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION);
    const env = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

    const phonepeClient = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      env
    );

    try {
      const callbackResponse = phonepeClient.validateCallback(
        process.env.PHONEPE_WEBHOOK_USERNAME,
        process.env.PHONEPE_WEBHOOK_PASSWORD,
        authorizationHeader,
        rawBody
      );

      const { merchantOrderId, state, amount } = callbackResponse.payload;

      // Update your DB with this order as 'PAID' or 'FAILED'
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: state === "COMPLETED" ? "PAID" : "FAILED" })
        .eq("order_id", merchantOrderId);

      if (error) throw new Error(error.message);

      console.log("✅ Webhook processed:", { orderId: merchantOrderId, state });

      res.status(200).send("Webhook processed");
    } catch (err) {
      console.error("❌ Webhook verification failed:", err.message);
      res.status(400).send("Invalid callback");
    }
  });

  return router;
};
