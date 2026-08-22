// // server.js
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import helmet from 'helmet';
// import compression from 'compression';
// import rateLimit from 'express-rate-limit';

// import authRoutes from './routes/authRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import patientRoutes from './routes/patientRoutes.js';
// import doctorRoutes from './routes/doctorRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import { setupInitialAdmin } from './utils/authHelpers.js';
// import publicDoctorRoutes from "./routes/publicDoctorRoutes.js";

// dotenv.config();

// const app = express();

// // Security middleware
// app.use(helmet());
// app.use(compression());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api', limiter);

// // CORS configuration
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true,
//   optionsSuccessStatus: 200
// }));

// // Body parser middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Routes\
// console.log("Mounting auth routes...");
// app.use('/api/auth', authRoutes);
// console.log("Loading auth routes...");
// app.use('/api/users', userRoutes);
// app.use('/api/patients', patientRoutes);
// // Public doctor listing (Patient)
// app.use("/api/doctors", publicDoctorRoutes);

// // Doctor dashboard APIs
// app.use("/api/doctor", doctorRoutes);

// // Admin APIs
// app.use("/api/admin", adminRoutes);

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     message: 'Server is running',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// app.get("/api/auth/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "Server Test Route Working"
//   });
// });
// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: 'Route not found',
//     message: `Cannot ${req.method} ${req.url}`
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
  
//   const status = err.status || 500;
//   const message = err.message || 'Internal Server Error';
  
//   res.status(status).json({
//     success: false,
//     error: message,
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // MongoDB Connection
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);

//     console.log("MongoDB Connected Successfully");
//     console.log("Host:", conn.connection.host);
//     console.log("Database:", conn.connection.name);

//     return conn;
//   } catch (error) {
//     console.error("MongoDB Connection Error:", error.message);
//     process.exit(1);
//   }
// };

// // Start server
// const startServer = async () => {
//   await connectDB();
  
//   // Setup initial admin
//   await setupInitialAdmin();
  
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
//   });
// };

// startServer();

// export default app;



// server.js

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

import { setupInitialAdmin } from './utils/authHelpers.js';
import publicDoctorRoutes from './routes/publicDoctorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();


// ======================================================
// SECURITY MIDDLEWARE
// ======================================================

app.use(helmet());
app.use(compression());


// ======================================================
// CORS CONFIGURATION
// ======================================================

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  })
);


// ======================================================
// RATE LIMITING
// ======================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);


// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);


// ======================================================
// ROUTES
// ======================================================

console.log('Mounting auth routes...');

app.use('/api/auth', authRoutes);

console.log('Auth routes loaded.');

app.use('/api/users', userRoutes);

app.use('/api/patients', patientRoutes);


// Public doctor listing
app.use('/api/doctors', publicDoctorRoutes);


// Doctor dashboard APIs
app.use('/api/doctor', doctorRoutes);


// Admin APIs
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);


// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


// ======================================================
// AUTH TEST ROUTE
// ======================================================

app.get('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server Test Route Working'
  });
});


// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`
  });
});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error('Global Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
});


// ======================================================
// MONGODB CONNECTION
// ======================================================

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected Successfully');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);

    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Create initial admin if required
    await setupInitialAdmin();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Environment: ${process.env.NODE_ENV || 'development'}`
      );
      console.log('Frontend URL: http://localhost:5173');
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};
startServer();

export default app;