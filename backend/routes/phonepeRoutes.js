const express = require("express");
const router = express.Router();
const {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} = require("pg-sdk-node");
const axios = require("axios");

// Pass Supabase instance when registering this router
module.exports = (supabase) => {
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

  // -------------------------------
  // ✅ POST /api/payment/phonepe
  // -------------------------------
  router.post("/", async (req, res) => {
    try {
      const { amount, customer, orderedItems, orderDetails } = req.body;

      if (!amount || isNaN(amount) || !customer || !orderedItems || !orderDetails) {
        return res.status(400).json({ message: "Invalid or missing order details" });
      }

      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const redirectUrl = process.env.REDIRECT_URL;
      const callbackUrl = process.env.CALLBACK_URL;

      if (!redirectUrl || !callbackUrl) {
        return res.status(500).json({ message: "Missing REDIRECT_URL or CALLBACK_URL in environment" });
      }

      // Save the order with status "pending" in Supabase
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            order_id: orderId,
            customer_info: customer,
            ordered_items: orderedItems,
            subtotal: orderDetails.subtotal,
            discount_amount: orderDetails.discountAmount || 0,
            taxes: orderDetails.taxes || 0,
            shipping_cost: orderDetails.shippingCost || 0,
            additional_fees: orderDetails.additionalFees || 0,
            total_amount: orderDetails.finalTotal || amount / 100,
            payment_method: "phonepe",
            applied_coupon: orderDetails.appliedCoupon || null,
            order_status: "pending",
          }
        ])
        .select();

      if (error) {
        console.error("❌ Failed to save order to Supabase:", error);
        return res.status(500).json({ message: "Failed to save order in database" });
      }

      console.log("📦 Order saved. Initiating PhonePe payment for:", orderId);

      const payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(orderId)
        .amount(amount)
        .redirectUrl(redirectUrl)
        .build({ callbackUrl });

      const client = getPhonePeClient();
      const response = await client.pay(payRequest);

      console.log("✅ PhonePe SDK response:", response);

      if (response?.redirectUrl) {
        return res.status(200).json({ paymentUrl: response.redirectUrl, orderId });
      } else {
        return res.status(500).json({ message: "PhonePe did not return a payment redirect URL" });
      }
    } catch (err) {
      console.error("❌ PhonePe Payment Error:", err);
      return res.status(500).json({ message: "PhonePe payment initiation failed", error: err.message });
    }
  });

  // -------------------------------
  // ✅ POST /api/payment/phonepe/webhook
  // -------------------------------
  router.post("/webhook", express.json(), async (req, res) => {
    const { orderId, state } = req.body;

    console.log("📬 Received webhook from PhonePe:", req.body);

    if (!orderId || !state) {
      return res.status(400).send("Invalid webhook payload");
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ order_status: state === "COMPLETED" ? "confirmed" : "failed" })
        .eq("order_id", orderId)
        .select();

      if (error || !data || data.length === 0) {
        console.error("❌ Failed to update order status in Supabase:", error);
        return res.status(500).send("Failed to update order status");
      }

      console.log(`✅ Order ${orderId} updated to status ${state}`);

      // Optional: Send emails after confirmation
      if (state === "COMPLETED") {
        try {
          await axios.post(`${process.env.BACKEND_URL}/api/send-email`, {
            email: data[0].customer_info.email,
            fullName: data[0].customer_info.fullName,
            address: data[0].customer_info.address,
            city: data[0].customer_info.city,
            state: data[0].customer_info.state,
            postalCode: data[0].customer_info.postalCode,
            phoneNumber: data[0].customer_info.phoneNumber,
            paymentMethod: "phonepe",
            orderDetails: {
              items: data[0].ordered_items,
              subtotal: data[0].subtotal,
              discountAmount: data[0].discount_amount,
              taxes: data[0].taxes,
              shippingCost: data[0].shipping_cost,
              additionalFees: data[0].additional_fees,
              finalTotal: data[0].total_amount
            },
            orderId
          });

          console.log("📧 Emails sent after PhonePe payment success");
        } catch (emailErr) {
          console.error("❌ Failed to send emails after payment:", emailErr.message);
        }
      }

      res.status(200).send("Webhook processed");
    } catch (err) {
      console.error("❌ Webhook processing failed:", err.message);
      res.status(500).send("Webhook error");
    }
  });

  return router;
};
