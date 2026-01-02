import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import equipmentsRouter from './routes/equipments';
import consumptionRouter from './routes/consumption';
import notificationsRouter from './routes/notifications';
import predictionsRouter from './routes/predictions';
import ordersRouter from './routes/orders';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// CORS configuration - support both Production and Preview deployments
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ai-store-frontend.vercel.app', // Production Vercel URL
];

// Add FRONTEND_URL from environment if provided
if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
  if (!allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl);
  }
}

// CRITICAL: CORS middleware MUST be the VERY FIRST middleware
// This MUST be before ANY other middleware including helmet, morgan, express.json, etc.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log all requests for debugging (especially OPTIONS preflight)
  console.log(`[CORS] ${req.method} ${req.path} | Origin: ${origin || 'none'}`);
  
  // Normalize origin (remove trailing slash)
  const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;

  // Check if origin should be allowed
  let isAllowed = false;
  
  if (!origin) {
    // Allow requests with no origin (like mobile apps or curl requests)
    isAllowed = true;
    console.log('[CORS] ✅ Allowing request with no origin');
  } else if (normalizedOrigin?.startsWith('http://localhost:') || normalizedOrigin?.startsWith('http://127.0.0.1:')) {
    // Allow localhost for development
    isAllowed = true;
    console.log(`[CORS] ✅ Allowing localhost origin: ${origin}`);
  } else if (normalizedOrigin && allowedOrigins.some(allowed => normalizedOrigin === allowed)) {
    // Check explicit allowed origins
    isAllowed = true;
    console.log(`[CORS] ✅ Allowing explicit origin: ${origin}`);
  } else if (normalizedOrigin && (normalizedOrigin.includes('.vercel.app') || normalizedOrigin.endsWith('vercel.app'))) {
    // Allow all Vercel deployments (Production and Preview)
    isAllowed = true;
    console.log(`[CORS] ✅ Allowing Vercel origin: ${origin}`);
  } else {
    // Reject other origins
    console.warn(`[CORS] ❌ Blocked origin: ${origin}`);
    console.warn(`[CORS]    Allowed origins: ${allowedOrigins.join(', ')}`);
    console.warn(`[CORS]    Vercel preview URLs are also allowed`);
  }

  if (isAllowed) {
    // CRITICAL: Set CORS headers BEFORE any other middleware can interfere
    // MUST be set for ALL requests (including preflight OPTIONS)
    if (origin) {
      // CRITICAL: Use exact origin from request header, NOT from environment variable
      // This is the key fix - we MUST use the origin from the request, not a hardcoded value
      res.setHeader('Access-Control-Allow-Origin', origin);
      console.log(`[CORS] ✅ Set Access-Control-Allow-Origin to: "${origin}"`);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    
    // Handle preflight requests (OPTIONS) - MUST return early
    if (req.method === 'OPTIONS') {
      console.log(`[CORS] ✅ Preflight (OPTIONS) - returning 204 for origin: "${origin}"`);
      console.log(`[CORS] ✅ Response headers set: Access-Control-Allow-Origin="${res.getHeader('Access-Control-Allow-Origin')}"`);
      res.status(204).end();
      return; // CRITICAL: Must return here, don't call next()
    }
  } else if (origin) {
    // Reject the request
    console.error(`[CORS] ❌ Rejecting request from origin: ${origin}`);
    res.status(403).json({ error: `Not allowed by CORS: ${origin}` });
    return; // CRITICAL: Must return here, don't call next()
  }

  next();
});

// Middleware - helmet() after CORS to avoid conflicts
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database and environment check endpoint
app.get('/health/detailed', async (_req, res) => {
  try {
    const { supabase } = await import('./config/supabase');
    
    // Test database connection
    const { data, error } = await supabase
      .from('equipments')
      .select('count')
      .limit(1);
    
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      PORT: process.env.PORT || '3001',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set',
    };
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        connected: !error,
        error: error?.message || null,
        testQuery: data ? '✅ Success' : '❌ Failed',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// CORS debug endpoint - to check CORS configuration
app.get('/cors-debug', (req, res) => {
  const origin = req.headers.origin;
  res.json({
    origin: origin || 'none',
    normalizedOrigin: origin ? origin.replace(/\/$/, '') : null,
    isVercel: origin ? (origin.includes('.vercel.app') || origin.endsWith('vercel.app')) : false,
    allowedOrigins: allowedOrigins,
    frontendUrl: process.env.FRONTEND_URL || 'not set',
    corsHeader: res.getHeader('Access-Control-Allow-Origin') || 'not set',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/equipments', equipmentsRouter);
app.use('/api/consumption', consumptionRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/orders', ordersRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 CORS configured for Vercel deployments`);
  console.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔧 FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
  console.log(`🔍 CORS Debug endpoint: http://0.0.0.0:${PORT}/cors-debug`);
  console.log('='.repeat(50));
});

export default app;

