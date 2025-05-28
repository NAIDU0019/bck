// backend/src/app.js
require('dotenv').config(); // Load environment variables once at the very top

const express = require("express");
const cors = require("cors");
const http = require('http'); // Import the http module
const { Server } = require('socket.io'); // Import the Server class from socket.io
const { createClient } = require('@supabase/supabase-js');

// --- Import your route modules ---
const sendEmailRouter = require("./routes/sendEmail");
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes'); // This will now accept `io` as an argument

const app = express();
const server = http.createServer(app); // Create an HTTP server using your Express app
const PORT = process.env.PORT || 5000;

// --- Initialize Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Allow all origins or specify your frontend URL
    methods: ["GET", "POST", "PATCH"], // Allow necessary HTTP methods for Socket.IO handshake
    credentials: true // Allow cookies/auth headers if needed
  }
});

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("ERROR: Supabase URL or Service Key not found in .env. Check your backend/.env file.");
  process.exit(1); // Exit process if critical environment variables are missing
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase client initialized successfully.');
// --- END Supabase Client Initialization ---

// --- Express Middleware ---
app.use(cors()); // For Express routes
app.use(express.json()); // Crucial for parsing JSON request bodies

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
  console.log(`A client connected via WebSocket: ${socket.id}`);

  // You can add authentication for WebSocket connections here if needed.
  // For example, if adminKey is passed in socket.handshake.auth.token
  // if (socket.handshake.auth.token !== process.env.ADMIN_API_KEY) {
  //   socket.disconnect(true);
  //   console.warn(`Unauthorized WebSocket connection attempt from ${socket.id}`);
  //   return;
  // }

  socket.on('disconnect', () => {
    console.log(`Client disconnected via WebSocket: ${socket.id}`);
  });

  // You can listen for custom events from the client if needed
  // socket.on('adminHeartbeat', () => {
  //   console.log(`Received heartbeat from ${socket.id}`);
  // });
});

// --- Admin Authentication Middleware ---
const authenticateAdmin = (req, res, next) => {
  const adminApiKey = req.headers['x-admin-api-key']; // Expecting API key in custom header

  if (!adminApiKey || adminApiKey !== process.env.ADMIN_API_KEY) {
    console.warn('Unauthorized admin access attempt from IP:', req.ip);
    return res.status(401).json({ message: 'Unauthorized: Invalid Admin API Key' });
  }
  next(); // If key is valid, proceed to the next route handler
};
// --- END Admin Authentication Middleware ---

// --- API Routes ---

// Mount the sendEmailRouter under the /api path.
// The route defined inside sendEmail.js is "/send-email", so it becomes "/api/send-email".
app.use("/api", sendEmailRouter);

// 1. Order Creation Route (Public endpoint for your e-commerce frontend)
// Pass the configured Supabase client AND the Socket.IO instance to orderRoutes
app.use('/api/orders', orderRoutes(supabase, io)); // <--- Pass `io` here!

// 2. Admin Dashboard Routes (Protected by authentication)
app.use('/api/admin', authenticateAdmin, adminRoutes(supabase)); // Pass Supabase client and auth middleware

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('ADHYAA PICKLES Backend API is running!');
});

// --- Start the HTTP server (which Socket.IO is attached to) ---
server.listen(PORT, () => { // Use server.listen, not app.listen
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server also running on ws://localhost:${PORT}`);
});