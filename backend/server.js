// File: src/app.js
require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require("express");
const cors = require("cors");
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');


// ROUTES
const sendEmailRouter = require("./routes/sendEmail");
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const phonepeRoutes = require('./routes/phonepeRoutes'); // ✅ This one needs Supabase injection
const phonepeWebhook = require("./routes/phonepeWebhook");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase credentials missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log("✅ Supabase client initialized");

// ✅ Middleware
app.use(cors({
  origin: ["https://www.adhyaapickles.in"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json()); // Parse JSON requests

// ✅ Route Definitions
app.use("/api", sendEmailRouter);

// Injecting `supabase` (and `io` later) into routes that require it
app.use('/api/orders', orderRoutes(supabase, null));
app.use('/api/admin', authenticateAdmin, adminRoutes(supabase, null));

// ✅ Inject Supabase into PhonePe routes
app.use('/api/payment/phonepe', phonepeRoutes(supabase)); // 👈 FIXED HERE
app.use('/api/payment/phonepe/callback', express.raw({ type: '*/*' }), phonepeWebhook(supabase));
app.use(
  "/api/payment/phonepe/callback",
  express.raw({ type: "*/*" }), // must match PhonePe's content-type
  phonepeWebhook(supabase)
);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to ADHYAA PICKLES Backend");
});

// ✅ WebSocket Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  }
});

// ✅ Inject io into routes that depend on it (if needed)
app._router.stack.forEach((layer) => {
  if (layer.handle.length === 2) {
    try {
      layer.handle = layer.handle.bind(null, io);
    } catch (_) {}
  }
});

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket connected: ${socket.id}`);

  socket.on('subscribe', async (subscriptionData) => {
    try {
      if (!subscriptionData?.email || !subscriptionData.email.includes("@")) {
        return socket.emit('subscribed', { success: false, message: 'Invalid email address' });
      }

      const { error } = await supabase.from('emails').insert([{ email: subscriptionData.email }]);
      if (error) {
        return socket.emit('subscribed', { success: false, message: 'DB Error: ' + error.message });
      }

      socket.emit('subscribed', { success: true, message: 'Subscribed successfully' });
    } catch (err) {
      console.error('❌ Subscription error:', err.message);
      socket.emit('subscribed', { success: false, message: 'Server error during subscription' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket disconnected: ${socket.id}`);
  });
});

// ✅ Admin Authentication Middleware
function authenticateAdmin(req, res, next) {
  const adminApiKey = req.headers['x-admin-api-key'];
  if (!adminApiKey || adminApiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: "Unauthorized: Invalid Admin API Key" });
  }
  next();
}

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`✅ HTTP server running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
});
