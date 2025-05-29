require('dotenv').config(); // Load env variables first

const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

// --- Route imports ---
const sendEmailRouter = require("./routes/sendEmail");
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);

// Use Render's assigned PORT, or default to 5000 for local development
const PORT = process.env.PORT || 5000;
// Crucial for Render: Bind to 0.0.0.0 to be accessible externally
const HOST = '0.0.0.0';

// --- CORS Configuration ---
// Use the FRONTEND_URL environment variable, or allow all for local dev if not set
const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH'], // Ensure all methods your frontend uses are listed
  credentials: true // Important if you're sending cookies or authorization headers
}));
app.use(express.json()); // Middleware to parse JSON request bodies

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigin, // Allow connections from your frontend
    methods: ["GET", "POST", "PATCH"], // Methods allowed for WebSocket handshakes
    credentials: true
  }
});

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("ERROR: Supabase URL or Service Key not set. Exiting.");
  process.exit(1); // Exit if critical environment variables are missing
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase client initialized successfully.');

// --- WebSocket Events ---
io.on('connection', (socket) => {
  console.log(`Client connected via WebSocket: ${socket.id}`);

  // Emit 'newOrder' event to all connected clients (except the sender)
  // This is a placeholder; your order creation logic should trigger this
  // Example: When a new order is created in your database, fetch it and emit.
  // socket.emit('newOrder', { id: 'test-order-123', status: 'pending', ... });

  socket.on('disconnect', () => {
    console.log(`Client disconnected via WebSocket: ${socket.id}`);
  });

  // You can add more custom event listeners here for real-time updates
  // For example, if an order status changes:
  // socket.on('updateOrderStatus', (data) => {
  //   // Logic to update order in DB, then emit 'orderUpdated'
  //   io.emit('orderUpdated', data); // Broadcast the update
  // });
});

// --- Admin Auth Middleware ---
const authenticateAdmin = (req, res, next) => {
  const adminApiKey = req.headers['x-admin-api-key'];
  // Check if ADMIN_API_KEY is set in environment variables
  if (!process.env.ADMIN_API_KEY) {
    console.error("ADMIN_API_KEY is not set in environment variables.");
    return res.status(500).json({ message: 'Server configuration error: Admin API Key not set.' });
  }

  if (!adminApiKey || adminApiKey !== process.env.ADMIN_API_KEY) {
    console.warn('Unauthorized admin access attempt:', req.ip);
    return res.status(401).json({ message: 'Unauthorized: Invalid Admin API Key' });
  }
  next();
};

// --- API Routes ---
app.use("/api", sendEmailRouter);
// Pass supabase and io instances to orderRoutes for database and real-time updates
app.use('/api/orders', orderRoutes(supabase, io));
// Pass supabase to adminRoutes for database operations, and protect with auth middleware
app.use('/api/admin', authenticateAdmin, adminRoutes(supabase));

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.send('ADHYAA PICKLES Backend API is running!');
});

// --- Start Server ---
// Listen on the assigned PORT and bind to 0.0.0.0 for external access
server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`WebSocket server running on ws://${HOST}:${PORT}`);
});
