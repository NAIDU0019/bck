const express = require('express');
const router = express.Router();
const {
  handlePaymentRedirect
} = require('../controllers/paymentController');

router.get('/payment-response', handlePaymentRedirect);

module.exports = router;
