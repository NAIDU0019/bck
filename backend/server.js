require('dotenv').config();

const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const sendEmailRouter = require("./routes/sendEmail");
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// --- Login Route ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Demo login logic (replace with real auth)
  if (username === 'admin' && password === 'password') {
    // Return JSON with token or user info
    return res.json({ success: true, token: 'dummy-jwt-token', user: { username } });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("ERROR: Supabase URL or Service Key not set. Exiting.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase client initialized successfully.');

io.on('connection', (socket) => {
  console.log(`Client connected via WebSocket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected via WebSocket: ${socket.id}`);
  });
});

// --- Admin Auth Middleware ---
const authenticateAdmin = (req, res, next) => {
  const adminApiKey = req.headers['x-admin-api-key'];

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

app.use("/api", sendEmailRouter);
app.use('/api/orders', orderRoutes(supabase, io));
app.use('/api/admin', authenticateAdmin, adminRoutes(supabase));

app.get('/', (req, res) => {
  res.send('ADHYAA PICKLES Backend API is running!');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`WebSocket server running on ws://${HOST}:${PORT}`);
});
