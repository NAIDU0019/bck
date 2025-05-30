// src/routes/admin.js
const express = require('express');
const asyncHandler = require('express-async-handler'); // For simplifying error handling in async routes
// Razorpay client utility
const { generateInvoicePdf } = require('../services/pdfGenerator'); // PDF generation service

// This module exports a function that accepts 'supabase' and 'io' (Socket.IO instance)
module.exports = (supabase, io) => {
    const router = express.Router(); // Create a new Express router instance

    // --- Admin Dashboard API Endpoints ---

    // GET /api/admin/orders - Get All Orders (with filters and search)
    router.get('/orders', asyncHandler(async (req, res) => {
        const { status, search } = req.query; // Get status and search query parameters

        let query = supabase.from('orders').select('*'); // Start building Supabase query

        // Apply status filter if provided
        if (status && status !== 'all') {
            query = query.eq('order_status', status);
        }

        // Apply search filter if provided (case-insensitive search on order_id, customer name, or email)
        if (search) {
            query = query.or(`order_id.ilike.%${search}%,customer_info->>fullName.ilike.%${search}%,customer_info->>email.ilike.%${search}%`);
        }

        // Order results by creation date, newest first
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query; // Execute the query

        if (error) {
            console.error('Error fetching orders:', error.message);
            return res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
        }

        // Ensure 'ordered_items' is always an array to prevent frontend crashes
        const ordersWithParsedItems = data.map(order => ({
            ...order,
            ordered_items: order.ordered_items || []
        }));

        res.status(200).json(ordersWithParsedItems); // Send back the fetched orders
    }));

    // PATCH /api/admin/orders/:orderId - Update Order Status
    router.patch('/orders/:orderId', asyncHandler(async (req, res) => {
        const { orderId } = req.params; // Get order ID from URL
        const { newStatus } = req.body; // Get the new status from request body

        if (!newStatus) {
            return res.status(400).json({ message: 'New status is required.' });
        }

        // Define allowed status values for validation
        const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'cancelled_and_refunded'];
        if (!allowedStatuses.includes(newStatus)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        // Update the order status in Supabase
        const { data: order, error } = await supabase
            .from('orders')
            .update({ order_status: newStatus, updated_at: new Date().toISOString() }) // Update status and timestamp
            .eq('id', orderId) // Apply update to specific order
            .select() // Select the updated row to return it
            .single(); // Expect a single updated record

        if (error) {
            console.error(`Error updating order ${orderId}:`, error.message);
            return res.status(500).json({ message: 'Failed to update order status.', error: error.message });
        }

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Emit WebSocket event to notify connected clients about the order update
        io.emit('orderUpdated', order);

        res.status(200).json({ message: 'Order status updated successfully.', order });
    }));

    // POST /api/admin/orders/:orderId/refund - Initiate Refund
    router.post('/orders/:orderId/refund', asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        const { amount, paymentId } = req.body; // `amount` should be in paisa from frontend, `paymentId` is Razorpay's ID

        // Basic validation
        if (!amount || !paymentId) {
            return res.status(400).json({ message: 'Amount and payment ID are required for refund.' });
        }

        // Fetch order from your DB to get actual payment_id and total_amount for validation
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('payment_id, total_amount, order_status')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ message: 'Order not found or database error.' });
        }
        // Cross-check provided paymentId with the one in your database
        if (order.payment_id !== paymentId) {
            return res.status(400).json({ message: 'Provided payment ID does not match order record.' });
        }
        // Prevent double refunds or refunding cancelled orders
        if (['refunded', 'cancelled', 'cancelled_and_refunded'].includes(order.order_status)) {
            return res.status(400).json({ message: `Order is already ${order.order_status}. Cannot refund.` });
        }
        // Ensure refund amount doesn't exceed total amount (in paisa)
        if (amount > Math.round(order.total_amount * 100)) {
            return res.status(400).json({ message: 'Refund amount cannot exceed total order amount.' });
        }

        try {
            // Initiate refund via Razorpay API
            const refund = await razorpay.payments.refund(paymentId, {
                amount: amount, // Amount in paisa
                speed: 'optimum', // 'optimum' for instant, 'normal' for 5-7 days
            });

            // Update order status in your database to 'refunded'
            const { data: updatedOrder, error: updateError } = await supabase
                .from('orders')
                .update({
                    order_status: 'refunded',
                    updated_at: new Date().toISOString(),
                    // You could add refund details to a separate JSONB column here if needed
                })
                .eq('id', orderId)
                .select()
                .single();

            if (updateError) throw updateError;

            io.emit('orderUpdated', updatedOrder); // Emit WebSocket event for orderUpdated

            res.status(200).json({ message: 'Refund initiated successfully.', refund, updatedOrder });
        } catch (razorpayError) {
            console.error('Razorpay Refund Error:', razorpayError);
            // Razorpay errors often have `error.code` and `error.description`
            res.status(500).json({ message: 'Failed to initiate refund via Razorpay.', error: razorpayError.description || razorpayError.message });
        }
    }));

    // POST /api/admin/orders/:orderId/cancel - Cancel Order
    router.post('/orders/:orderId/cancel', asyncHandler(async (req, res) => {
        const { orderId } = req.params;

        // Fetch order to check current status and payment method
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, order_id, payment_method, payment_id, total_amount, order_status')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ message: 'Order not found or database error.' });
        }

        // Prevent cancellation if already cancelled or delivered
        if (['cancelled', 'delivered', 'refunded', 'cancelled_and_refunded'].includes(order.order_status)) {
            return res.status(400).json({ message: `Order cannot be cancelled. Current status: ${order.order_status}.` });
        }

        // Update order status to 'cancelled'
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({ order_status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) {
            console.error(`Error updating order ${orderId} to cancelled:`, updateError.message);
            return res.status(500).json({ message: 'Failed to update order status to cancelled.', error: updateError.message });
        }

        // Optional: Attempt to refund if it was a Razorpay payment and not already refunded
        if (order.payment_method === 'razorpay' && order.payment_id && order.order_status !== 'refunded') {
            try {
                console.log(`Attempting to refund cancelled order ${order.order_id} (Payment ID: ${order.payment_id})`);
                const refund = await razorpay.payments.refund(order.payment_id, {
                    amount: Math.round(order.total_amount * 100), // Refund full amount in paisa
                    speed: 'optimum',
                });
                console.log(`Refund initiated for cancelled order ${order.order_id}:`, refund);

                // If refund succeeds, update status to indicate both cancellation and refund
                const { data: finalUpdatedOrder } = await supabase.from('orders')
                    .update({ order_status: 'cancelled_and_refunded', updated_at: new Date().toISOString() })
                    .eq('id', orderId)
                    .select()
                    .single();

                io.emit('orderUpdated', finalUpdatedOrder); // Emit WebSocket event for the final status

            } catch (refundError) {
                console.error(`Error refunding cancelled order ${order.order_id}:`, refundError.description || refundError.message);
                // Log this error, but do not fail the cancellation itself.
                // Notify frontend that cancellation happened but refund failed.
                return res.status(200).json({
                    message: 'Order cancelled, but automatic refund failed. Please initiate refund manually.',
                    order: updatedOrder,
                    refundError: refundError.description || refundError.message
                });
            }
        } else {
            // Only emit if no refund was attempted or if COD
            io.emit('orderUpdated', updatedOrder); // Emit WebSocket event
        }

        res.status(200).json({ message: 'Order cancelled successfully.', order: updatedOrder });
    }));


    // GET /api/admin/orders/single-invoice/:orderId - Generate Single Invoice PDF
    // This route generates a PDF for a single order, typically opened in a new browser tab.
    router.get('/orders/single-invoice/:orderId', asyncHandler(async (req, res) => {
        const { orderId } = req.params; // Get the order ID from the URL parameters

        // Fetch the single order's detailed information from Supabase
        const { data: order, error } = await supabase
            .from('orders')
            .select('*') // Select all necessary details for the invoice
            .eq('id', orderId) // Filter by the specific order ID
            .single(); // Expect only one record

        // Handle case where order is not found or a database error occurs
        if (error || !order) {
            console.error(`Error fetching order ${orderId} for invoice:`, error?.message || 'Order not found');
            return res.status(404).json({ message: 'Order not found or database error.' });
        }

        // Set HTTP headers for PDF download. 'inline' suggests the browser should try to display it.
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=adhyaa_invoice_${order.order_id}.pdf`);

        // Generate the PDF for this single order and pipe it directly to the response stream
        // The `generateInvoicePdf` function expects an array of orders, so we pass `[order]`
        await generateInvoicePdf([order], res);

        // No `res.json()` here because the PDF stream is being sent directly.
    }));

    // POST /api/admin/orders/bulk-print - Generate Bulk Invoice PDF
    // This route generates a single PDF containing invoices for multiple selected orders.
    router.post('/orders/bulk-print', asyncHandler(async (req, res) => {
        const { orderIds } = req.body; // Expect an array of order IDs from the request body

        // Validate input
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ message: 'No order IDs provided for bulk print.' });
        }

        // Fetch detailed information for all selected orders from Supabase
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*') // Select all necessary details for the invoice
            .in('id', orderIds) // Filter by the provided array of IDs
            .order('created_at', { ascending: true }); // Order them for consistent PDF page order

        if (error) {
            console.error('Error fetching orders for bulk print:', error.message);
            return res.status(500).json({ message: 'Failed to retrieve orders for printing.', error: error.message });
        }

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found matching the provided IDs.' });
        }

        // Set HTTP headers for PDF download. 'attachment' prompts the browser to download the file.
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=adhyaa_bulk_invoices_${Date.now()}.pdf`);

        // Generate the PDF for the fetched orders and pipe it directly to the response stream
        await generateInvoicePdf(orders, res);

        // No `res.json()` here because the PDF stream is being sent directly.
    }));

    return router; // Export the router with all defined routes
};
