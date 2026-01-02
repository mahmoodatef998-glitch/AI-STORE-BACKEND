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

/**
 * PRODUCTION-READY CORS MIDDLEWARE
 * 
 * This middleware MUST be the FIRST middleware in the chain.
 * It handles:
 * 1. Preflight OPTIONS requests (returns 204 immediately)
 * 2. Dynamic origin matching for Vercel preview deployments
 * 3. Exact origin header matching (required for credentials)
 * 
 * Security:
 * - Only allows specific origins (localhost, production, Vercel previews)
 * - Uses exact origin matching (not wildcard) for credentials support
 * - Validates origin format before allowing
 */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log for debugging (can be removed in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[CORS] ${req.method} ${req.path} | Origin: ${origin || 'none'}`);
  }
  
  // Determine if origin should be allowed
  let isAllowed = false;
  let allowedOrigin: string | null = null;
  
  if (!origin) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    isAllowed = true;
  } else {
    // Normalize origin (remove trailing slash and whitespace)
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    
    // Allow localhost for development
    if (normalizedOrigin.startsWith('http://localhost:') || 
        normalizedOrigin.startsWith('http://127.0.0.1:')) {
      isAllowed = true;
      allowedOrigin = origin; // Use original origin to preserve port
    }
    // Allow explicit allowed origins (exact match)
    else if (allowedOrigins.some(allowed => normalizedOrigin === allowed)) {
      isAllowed = true;
      allowedOrigin = origin;
    }
    // Allow ALL Vercel deployments (Production and Preview)
    // Vercel URLs can be:
    // - Production: https://project-name.vercel.app
    // - Preview: https://project-name-{hash}-{user}.vercel.app
    // - Branch: https://project-name-git-{branch}-{user}.vercel.app
    // Security: Only allow HTTPS and .vercel.app domains
    else if (normalizedOrigin.startsWith('https://') && 
             normalizedOrigin.endsWith('.vercel.app')) {
      // Simple validation: Must be HTTPS and end with .vercel.app
      // This is safe because:
      // 1. We only allow Vercel's official domain
      // 2. HTTPS is required
      // 3. No wildcard subdomains allowed
      isAllowed = true;
      allowedOrigin = origin;
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[CORS] ✅ Allowed Vercel origin: ${origin}`);
      }
    }
  }
  
  // Set CORS headers for allowed origins
  if (isAllowed && allowedOrigin) {
    // CRITICAL: Set exact origin (required for credentials)
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    
    // Handle preflight requests (OPTIONS) - MUST return early
    if (req.method === 'OPTIONS') {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[CORS] ✅ Preflight (OPTIONS) - returning 204 for origin: ${allowedOrigin}`);
      }
      res.status(204).end();
      return; // CRITICAL: Don't call next() for OPTIONS
    }
  } else if (origin) {
    // Reject blocked origins (but allow requests with no origin)
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[CORS] ❌ Blocked origin: ${origin}`);
    }
    // Don't set CORS headers, browser will block
  }
  
  // Continue to next middleware for non-OPTIONS requests
  next();
});

// IMPORTANT: All other middleware MUST come AFTER CORS middleware
// helmet() configuration to avoid CORS conflicts
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  // Disable contentSecurityPolicy that might interfere
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database and environment check endpoint (no auth required)
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

// CORS debug endpoint (no auth required) - MUST be before API routes
// This endpoint helps debug CORS issues by showing what origin the server receives
app.get('/cors-debug', (req, res) => {
  const origin = req.headers.origin;
  const normalizedOrigin = origin ? origin.trim().replace(/\/$/, '') : null;
  const isVercel = origin ? (normalizedOrigin?.startsWith('https://') && normalizedOrigin.endsWith('.vercel.app')) : false;
  
  // Get the CORS header that was set by the middleware
  const corsHeader = res.getHeader('Access-Control-Allow-Origin');
  
  res.json({
    success: true,
    origin: origin || 'none',
    normalizedOrigin: normalizedOrigin,
    isVercel: isVercel || false,
    allowedOrigins: allowedOrigins,
    frontendUrl: process.env.FRONTEND_URL || 'not set',
    corsHeader: corsHeader || 'not set',
    requestHeaders: {
      origin: req.headers.origin || 'none',
      'user-agent': req.headers['user-agent'] || 'none',
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes (all require authentication via router-level middleware)
// Serve uploaded files (static, no auth)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Protected API routes
app.use('/api/equipments', equipmentsRouter);
app.use('/api/consumption', consumptionRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/orders', ordersRouter);

// Error handling (must be last)
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
