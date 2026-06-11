import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import analyzeRoutes from './routes/analyze.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for local dev configurations
app.use(cors({
  origin: '*', // Allow all origins for developers' ease of use
  credentials: true
}));

// Express built-in body parsers (supports standard JSON & base64 image strings up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to Database (MongoDB or fallback to local JSON file)
connectDB();

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'NutriAI Backend API',
    mode: process.env.MONGODB_URI ? 'MongoDB' : 'Local Fallback JSON DB'
  });
});

// Mounting Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analyze', analyzeRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `🚀 NutriAI Server running on port ${PORT}`);
  console.log('\x1b[34m%s\x1b[0m', `🔗 Health Check available at http://localhost:${PORT}/health`);
});
