const express = require('express');
const axios = require('axios');

module.exports = (supabase, io) => {
  const router = express.Router();

  // -------------------------------
  // ✅ POST /api/orders
  // -------------------------------
  router.post('/', async (req, res) => {
    try {
      const orderData = req.body;
      const appliedCouponCode = req.header('X-Applied-Coupon');

      console.log("\n--- START ORDER PROCESSING ---");
      console.log("Timestamp:", new Date().toISOString());
      console.log("1. Received orderData from frontend:", JSON.stringify(orderData, null, 2));

      if (!orderData.orderId || !orderData.customerInfo || !orderData.orderedItems || typeof orderData.totalAmount === 'undefined') {
        console.error("1a. Input Validation Failed: Missing required order fields.", orderData);
        return res.status(400).json({ message: 'Missing required order fields.' });
      }

      const orderToInsert = {
        order_id: orderData.orderId,
        customer_info: orderData.customerInfo,
        ordered_items: orderData.orderedItems,
        subtotal: orderData.orderDetails?.subtotal,
        discount_amount: orderData.orderDetails?.discountAmount || 0,
        taxes: orderData.orderDetails?.taxes || 0,
        shipping_cost: orderData.orderDetails?.shippingCost || 0,
        additional_fees: orderData.orderDetails?.additionalFees || 0,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        payment_id: orderData.paymentId || null,
        applied_coupon: appliedCouponCode
          ? { code: appliedCouponCode, discountPercent: orderData.appliedCoupon?.discountPercent || 0 }
          : null,
        order_status: 'pending',
      };
      console.log("2. Prepared orderToInsert for Supabase:", JSON.stringify(orderToInsert, null, 2));

      const { data, error } = await supabase
        .from('orders')
        .insert([orderToInsert])
        .select();

      if (error) {
        console.error('\n--- SUPABASE INSERT FAILED ---');
        console.error('Supabase Error:', error);
        return res.status(500).json({ message: 'Failed to place order in database', error: error.message });
      }

      const newOrder = data[0];
      console.log(`4. Order ${newOrder.order_id} saved to Supabase (UUID: ${newOrder.id})`);

      const backendBaseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const sendEmailUrl = `${backendBaseUrl}/api/send-email`;

      const emailPayload = {
        email: newOrder.customer_info.email,
        fullName: newOrder.customer_info.fullName,
        address: newOrder.customer_info.address,
        city: newOrder.customer_info.city,
        state: newOrder.customer_info.state,
        postalCode: newOrder.customer_info.postalCode,
        phoneNumber: newOrder.customer_info.phoneNumber,
        paymentMethod: newOrder.payment_method,
        orderDetails: {
          items: newOrder.ordered_items,
          subtotal: newOrder.subtotal,
          discountAmount: newOrder.discount_amount,
          taxes: newOrder.taxes,
          shippingCost: newOrder.shipping_cost,
          additionalFees: newOrder.additional_fees,
          finalTotal: newOrder.total_amount,
        },
        orderId: newOrder.order_id,
      };

      try {
        const emailResponse = await axios.post(sendEmailUrl, emailPayload);
        console.log(`6. Confirmation email sent. Response: ${emailResponse.data.message}`);
      } catch (emailAxiosError) {
        console.error("6a. Email sending failed:", emailAxiosError.message);
      }

      res.status(201).json({
        message: 'Order placed successfully',
        orderId: newOrder.order_id,
        supabaseId: newOrder.id
      });

      console.log("--- END ORDER PROCESSING ---\n");

    } catch (error) {
      console.error('\n--- UNEXPECTED SERVER ERROR ---');
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  // -------------------------------
  // ✅ GET /api/orders/products/:id/reviews
  // -------------------------------
  router.get('/products/:id/reviews', async (req, res) => {
    const productId = req.params.id;

    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, user_id (name)')
        .eq('product_id', productId);

      if (error) {
        console.error("Supabase error fetching reviews:", error);
        return res.status(500).json({ message: 'Error fetching reviews' });
      }

      const formatted = reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        author: review.user_id?.name || 'Anonymous',
      }));

      res.status(200).json({ reviews: formatted });

    } catch (err) {
      console.error("Server error fetching reviews:", err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
};
