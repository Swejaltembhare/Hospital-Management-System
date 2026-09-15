import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';

import { setupInitialAdmin } from './utils/authHelpers.js';
import publicDoctorRoutes from './routes/publicDoctorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import labTestRoutes from './routes/labTestRoutes.js';

dotenv.config();

const app = express();

// Apply security headers and HTTP response compression
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

// Configure Cross-Origin Resource Sharing for API access
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://hospital-management-system-flax-three.vercel.app',
      'https://hospital-management-system-swejal.vercel.app', // <-- YEH WALA URL ADD KAREIN
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

// Apply rate limiting middleware to prevent API abuse and brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Too many login/auth attempts, please try again later.',
  },
});

app.use('/api', limiter);

// Parse JSON and URL-encoded request payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount application API router modules
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', publicDoctorRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin/export', exportRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// System health status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Handle unmapped routes with 404 response
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Global application error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Connect to MongoDB database instance
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in .env file');
      process.exit(1);
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Initialize database connection, sync initial admin, and launch Express server
const startServer = async () => {
  try {
    await connectDB();
    await setupInitialAdmin();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;