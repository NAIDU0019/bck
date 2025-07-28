const express = require("express");
const axios = require("axios");
const {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} = require("pg-sdk-node");

const router = express.Router();

let supabase = null; // will be injected
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

// ✅ INITIATE PAYMENT
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
      .build({ callbackUrl });

    const client = getPhonePeClient();
    const response = await client.pay(payRequest);

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
    console.error("❌ PhonePe Payment Error:", err);
    return res.status(500).json({
      message: "PhonePe payment initiation failed",
      error: err.message,
    });
  }
});

// ✅ WEBHOOK ENDPOINT (Optional - for future)
router.post("/webhook", express.json(), (req, res) => {
  const { orderId, state } = req.body;

  console.log("📬 Received webhook from PhonePe:", req.body);

  // You can verify signature and update DB here if needed.

  res.status(200).send("Webhook received");
});

// ✅ POLL PAYMENT STATUS AND UPDATE ORDER
router.get("/status/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  const client = getPhonePeClient();

  try {
    const statusRes = await client.checkStatus(orderId);

    if (statusRes.success && statusRes.data?.status === "SUCCESS") {
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_id: statusRes.data.transactionId,
          order_status: "paid",
        })
        .eq("order_id", orderId)
        .select();

      if (error) return res.status(500).json({ message: "DB update failed", error });

      // Send confirmation email
      const backendBaseUrl = process.env.BACKEND_URL || "http://localhost:5000";
      await axios.post(`${backendBaseUrl}/api/send-email`, {
        ...data[0].customer_info,
        paymentMethod: data[0].payment_method,
        orderDetails: {
          items: data[0].ordered_items,
          subtotal: data[0].subtotal,
          discountAmount: data[0].discount_amount,
          taxes: data[0].taxes,
          shippingCost: data[0].shipping_cost,
          additionalFees: data[0].additional_fees,
          finalTotal: data[0].total_amount,
        },
        orderId: data[0].order_id,
      });

      return res.json({ message: "Payment confirmed", order: data[0] });
    }

    return res.json({ message: "Payment not confirmed yet", status: statusRes.data?.status });
  } catch (err) {
    console.error("❌ Error in status check:", err.message);
    return res.status(500).json({ error: "Unable to check payment status" });
  }
});


// ✅ Export router with injected Supabase instance
module.exports = (injectedSupabase) => {
  supabase = injectedSupabase;
  return router;
};
