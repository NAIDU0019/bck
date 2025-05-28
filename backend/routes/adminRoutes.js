// backend/src/routes/adminRoutes.js
const express = require('express');

module.exports = (supabase) => { // Receives the initialized Supabase client
  const router = express.Router();

  // GET /api/admin/orders - Fetch all orders (with optional filters/search)
  router.get('/orders', async (req, res) => {
    try {
      let query = supabase.from('orders').select('*'); // Start with selecting all columns

      // --- Apply Filters ---
      const { status, search } = req.query; // Get 'status' and 'search' query parameters
      if (status && status !== 'all') {
        query = query.eq('order_status', status); // Filter by order status
      }
      if (search) {
        // Search by order_id or customer full name (case-insensitive LIKE)
        query = query.or(`order_id.ilike.%${search}%,customer_info->>fullName.ilike.%${search}%`);
      }

      // --- Order Results ---
      query = query.order('created_at', { ascending: false }); // Sort by creation date, newest first

      // --- Execute Query ---
      const { data, error } = await query;

      if (error) {
        console.error('Supabase Fetch Orders Error:', error);
        return res.status(500).json({ message: 'Error fetching orders', error: error.message });
      }

      res.status(200).json(data); // Send the fetched orders as JSON
    } catch (error) {
      console.error('Unexpected error in GET /api/admin/orders:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  // PATCH /api/admin/orders/:id - Update an order's status
  router.patch('/orders/:id', async (req, res) => {
    const { id } = req.params; // Get the Supabase UUID of the order from URL parameters
    const { newStatus } = req.body; // Get the new status from the request body

    // --- Input Validation ---
    if (!newStatus) {
      return res.status(400).json({ message: 'New status is required.' });
    }
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid order status provided.' });
    }

    try {
      // --- Update Order in Supabase ---
      const { data, error } = await supabase
        .from('orders')
        .update({
          order_status: newStatus,
          updated_at: new Date().toISOString() // Update the timestamp
        })
        .eq('id', id) // Find the order by its Supabase UUID
        .select(); // Return the updated row

      if (error) {
        console.error(`Supabase Update Order Error for ${id}:`, error);
        return res.status(500).json({ message: `Error updating order ${id}`, error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      res.status(200).json({ message: 'Order updated successfully', order: data[0] });
    } catch (error) {
      console.error('Unexpected error in PATCH /api/admin/orders/:id:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  return router; // Return the configured router
};