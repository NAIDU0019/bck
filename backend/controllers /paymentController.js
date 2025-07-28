const { verifyPhonePePaymentStatus } = require('../utils/phonepe');

exports.handlePaymentRedirect = async (req, res) => {
  const transactionId = req.query.transactionId;

  if (!transactionId) {
    return res.redirect("/checkout?error=Invalid+transaction");
  }

  try {
    const status = await verifyPhonePePaymentStatus(transactionId);

    if (status === "SUCCESS") {
      return res.redirect(`/success?txn=${transactionId}`);
    } else {
      return res.redirect(`/checkout?error=Payment+${status}`);
    }
  } catch (err) {
    console.error("Payment verification failed:", err.message);
    return res.redirect("/checkout?error=Verification+failed");
  }
};
