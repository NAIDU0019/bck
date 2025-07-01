const express = require("express");
const router = express.Router();
const {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} = require("pg-sdk-node");

let phonepeClient = null;

const getPhonePeClient = () => {
  if (!phonepeClient) {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || "1");
    const env = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

    if (!clientId || !clientSecret) {
      throw new Error("PhonePe credentials are missing from environment variables.");
    }

    phonepeClient = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      env
    );

    console.log("✅ PhonePe client initialized");
  }

  return phonepeClient;
};

router.post("/", async (req, res) => {
  try {
    const { amount, customer } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid or missing amount" });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const redirectUrl = process.env.REDIRECT_URL;
    const callbackUrl = process.env.CALLBACK_URL;

    if (!redirectUrl || !callbackUrl) {
      return res.status(500).json({ message: "Missing REDIRECT_URL or CALLBACK_URL in environment" });
    }

    console.log("🧾 Initiating PhonePe payment with orderId:", orderId);

    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(orderId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build({
        callbackUrl: callbackUrl, // ✅ CORRECT WAY
      });

    const client = getPhonePeClient();
    const response = await client.pay(payRequest);

    console.log("📦 PhonePe Response:", response);

    if (response?.redirectUrl) {
      return res.status(200).json({
        paymentUrl: response.redirectUrl,
        orderId,
      });
    } else {
      return res.status(500).json({
        message: "PhonePe did not return a payment redirect URL",
      });
    }
  } catch (err) {
    console.error("❌ PhonePe Payment Error:", {
      message: err.message,
      stack: err.stack,
      request: req.body,
    });

    return res.status(500).json({
      message: "PhonePe payment initiation failed",
      error: err.message,
    });
  }
});
router.post("/webhook", express.json(), (req, res) => {
  const { orderId, state, ...rest } = req.body;

  console.log("📬 Received webhook from PhonePe:", req.body);

  // TODO: Verify signature if needed
  // TODO: Update your DB with `state` info (e.g., SUCCESS, FAILED, etc.)

  res.status(200).send("Webhook received");
});


module.exports = router;
