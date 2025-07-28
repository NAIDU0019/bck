const crypto = require("crypto");
const axios = require("axios");

const merchantId = "YOUR_MERCHANT_ID";
const phonepeSaltKey = "YOUR_SALT_KEY";
const phonepeSaltIndex = "YOUR_SALT_INDEX";

exports.verifyPhonePePaymentStatus = async (transactionId) => {
  const apiPath = `/pg/v1/status/${merchantId}/${transactionId}`;
  const baseUrl = "https://api.phonepe.com/apis/hermes";

  const xVerify = crypto
    .createHash("sha256")
    .update(apiPath + phonepeSaltKey + phonepeSaltIndex)
    .digest("hex") + `###${phonepeSaltIndex}`;

  const response = await axios.get(`${baseUrl}${apiPath}`, {
    headers: {
      "X-VERIFY": xVerify,
      "X-MERCHANT-ID": merchantId
    }
  });

  return response.data?.data?.state; // 'SUCCESS', 'FAILED', 'CANCELLED'
};
