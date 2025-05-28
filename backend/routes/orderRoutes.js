// backend/src/routes/orderRoutes.js
const express = require('express');
const axios = require('axios'); // Required for making HTTP requests

module.exports = (supabase, io) =>{
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const orderData = req.body;
      const appliedCouponCode = req.header('X-Applied-Coupon');

      console.log("\n--- START ORDER PROCESSING ---");
      console.log("Timestamp:", new Date().toISOString());
      console.log("1. Received orderData from frontend:", JSON.stringify(orderData, null, 2));

      // Basic input validation
      if (!orderData.orderId || !orderData.customerInfo || !orderData.orderedItems || typeof orderData.totalAmount === 'undefined') {
        console.error("1a. Input Validation Failed: Missing required order fields.", orderData);
        return res.status(400).json({ message: 'Missing required order fields.' });
      }

      // Prepare data for Supabase insert
      const orderToInsert = {
        order_id: orderData.orderId,
        customer_info: orderData.customerInfo, // This will be stored as JSONB
        ordered_items: orderData.orderedItems, // This will be stored as JSONB
        subtotal: orderData.orderDetails?.subtotal,
        discount_amount: orderData.orderDetails?.discountAmount || 0,
        taxes: orderData.orderDetails?.taxes || 0,
        shipping_cost: orderData.orderDetails?.shippingCost || 0,
        additional_fees: orderData.orderDetails?.additionalFees || 0,
        total_amount: orderData.totalAmount, // This is the final total
        payment_method: orderData.paymentMethod,
        payment_id: orderData.paymentId || null,
        applied_coupon: appliedCouponCode ? { code: appliedCouponCode, discountPercent: orderData.appliedCoupon?.discountPercent || 0 } : null, // This will be stored as JSONB
        // MODIFICATION: Set order_status to 'pending' by default for all new orders
        order_status: 'pending',
      };
      console.log("2. Prepared orderToInsert for Supabase:", JSON.stringify(orderToInsert, null, 2));

      // --- Insert Order into Supabase ---
      console.log("3. Attempting Supabase insert into 'orders' table...");
      const { data, error } = await supabase
        .from('orders')
        .insert([orderToInsert])
        .select(); // Use .select() to get the inserted data back, including the generated ID

      if (error) {
        console.error('\n--- SUPABASE INSERT FAILED ---');
        console.error('Supabase Error Object:', error);
        console.error('Message:', error.message);
        console.error('Hint:', error.hint);
        console.error('Details:', error.details);
        console.error('Code:', error.code);
        console.error('--- END SUPABASE INSERT FAILED ---\n');
        return res.status(500).json({ message: 'Failed to place order in database', error: error.message });
      }

      const newOrder = data[0]; // Get the first (and only) inserted record
      console.log(`4. Order ${newOrder.order_id} saved to Supabase (UUID: ${newOrder.id})`);
      console.log("DEBUG: newOrder from Supabase:", JSON.stringify(newOrder, null, 2)); // Added debug log

      // --- Send Order Confirmation Email via internal API call ---
      console.log("5. Attempting to trigger email sending via /api/send-email...");
      const backendBaseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const sendEmailUrl = `${backendBaseUrl}/api/send-email`;

      // Construct payload for the /api/send-email endpoint from the newly saved order data
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
          items: newOrder.ordered_items, // Use the structured items from newOrder
          subtotal: newOrder.subtotal,
          discountAmount: newOrder.discount_amount,
          taxes: newOrder.taxes,
          shippingCost: newOrder.shipping_cost,
          additionalFees: newOrder.additional_fees,
          finalTotal: newOrder.total_amount, // Use total_amount from newOrder for finalTotal
        },
        orderId: newOrder.order_id,
      };

      // --- DEBUGGING LOGS FOR emailPayload ---
      console.log("DEBUG: emailPayload being sent to /api/send-email:");
      console.log(JSON.stringify(emailPayload, null, 2));
      console.log("DEBUG: Does emailPayload.orderDetails exist?", !!emailPayload.orderDetails);
      console.log("DEBUG: Does emailPayload.orderDetails.items exist?", !!emailPayload.orderDetails?.items);
      console.log("DEBUG: Type of emailPayload.orderDetails.items:", typeof emailPayload.orderDetails?.items);
      if (Array.isArray(emailPayload.orderDetails?.items)) {
          console.log("DEBUG: Length of emailPayload.orderDetails.items:", emailPayload.orderDetails.items.length);
      }
      // --- END DEBUGGING LOGS ---

      try {
        const emailResponse = await axios.post(sendEmailUrl, emailPayload);
        console.log(`6. Confirmation email for order ${newOrder.order_id} successfully sent (via /api/send-email). Response: ${emailResponse.data.message}`);
      } catch (emailAxiosError) {
        console.error("6a. Failed to send confirmation email via /api/send-email for order:", newOrder.order_id);
        if (emailAxiosError.response) {
          console.error('Email service error response:', emailAxiosError.response.data);
          console.error('Email service error status:', emailAxiosError.response.status);
        } else if (emailAxiosError.request) {
          console.error('Email service no response:', emailAxiosError.request);
        } else {
          console.error('Error setting up email request:', emailAxiosError.message);
        }
      }

      console.log("7. Responding to frontend with success.");
      res.status(201).json({
        message: 'Order placed successfully',
        orderId: newOrder.order_id,
        supabaseId: newOrder.id
      });
      console.log("--- END ORDER PROCESSING ---\n");

    } catch (error) {
      console.error('\n--- UNEXPECTED SERVER ERROR IN POST /api/orders ---');
      console.error('Error object:', error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('--- END UNEXPECTED SERVER ERROR ---\n');
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  return router;
};
