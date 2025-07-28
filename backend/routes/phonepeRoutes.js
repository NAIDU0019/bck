const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const router = express.Router();

const saltKey = process.env.PHONEPE_SALT_KEY;
const merchantId = process.env.PHONEPE_MERCHANT_ID;
const saltIndex = 1;

const phonepeUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const redirectUrl = "https://yourdomain.com/phonepe-redirect"; // Replace with your redirect URL

router.post("/", async (req, res) => {
  try {
    const {
      amount,
      customerInfo,
      orderedItems,
      orderDetails,
      paymentMethod,
      appliedCoupon,
    } = req.body;

    // Validate required fields
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ message: "Invalid or missing 'amount'" });
    }

    if (!orderDetails || typeof orderDetails.subtotal !== "number") {
      return res.status(400).json({ message: "Missing or malformed 'orderDetails'" });
    }

    const transactionId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payload = {
      merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: "user-" + Date.now(), // optional
      amount: amount,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: redirectUrl,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
      metadata: {
        customerInfo,
        orderedItems,
        orderDetails,
        paymentMethod,
        appliedCoupon,
      },
    };

    const payloadString = JSON.stringify(payload);
    const base64EncodedPayload = Buffer.from(payloadString).toString("base64");

    const dataToHash = base64EncodedPayload + "/pg/v1/pay" + saltKey;
    const sha256Hash = crypto.createHash("sha256").update(dataToHash).digest("hex");
    const xVerify = sha256Hash + "###" + saltIndex;

    const options = {
      method: "POST",
      url: `${phonepeUrl}/pg/v1/pay`,
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      data: {
        request: base64EncodedPayload,
      },
    };

    const phonePeRes = await axios(options);
    const redirectURL = phonePeRes.data.data.instrumentResponse.redirectInfo.url;

    return res.status(200).json({
      message: "PhonePe client initialized",
      transactionId,
      redirectURL,
    });

  } catch (error) {
    console.error("❌ PhonePe Payment Error:", error);
    return res.status(500).json({
      message: "PhonePe payment initiation failed",
      error: error.message || "Unexpected error",
    });
  }
});

module.exports = router;
