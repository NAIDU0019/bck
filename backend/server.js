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
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("ERROR: Supabase URL or Service Key not set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase client initialized successfully.');

// --- WebSocket Events ---
io.on('connection', (socket) => {
  console.log(`Client connected via WebSocket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected via WebSocket: ${socket.id}`);
  });

  // Add custom event listeners if needed
});

// --- Admin Auth Middleware ---
const authenticateAdmin = (req, res, next) => {
  const adminApiKey = req.headers['x-admin-api-key'];
  if (!adminApiKey || adminApiKey !== process.env.ADMIN_API_KEY) {
    console.warn('Unauthorized admin access attempt:', req.ip);
    return res.status(401).json({ message: 'Unauthorized: Invalid Admin API Key' });
  }
  next();
};

// --- API Routes ---
app.use("/api", sendEmailRouter);
app.use('/api/orders', orderRoutes(supabase, io));
app.use('/api/admin', authenticateAdmin, adminRoutes(supabase));

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.send('ADHYAA PICKLES Backend API is running!');
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
