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

// CRITICAL: PORT validation - Railway provides PORT automatically
const PORT = Number(process.env.PORT) || 3001;
if (!PORT || isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error('❌ Invalid PORT:', process.env.PORT);
  process.exit(1);
}
console.log(`[SERVER] Starting on port ${PORT} (from env: ${process.env.PORT || 'default'})`);

// ============================================
// CRITICAL: Define routes FIRST - before ANY middleware
// ============================================
// These routes MUST work if Express is working
// They are defined FIRST to ensure they're registered before middleware

// IMPORTANT: Register routes immediately after app creation
// This ensures they're registered before any middleware

// Root route for testing - MUST be first
app.get('/', (_req, res) => {
  console.log('[ROOT] ✅ Route handler called!');
  res.json({ 
    success: true, 
    message: 'Backend API is running',
    endpoints: {
      ping: '/ping',
      health: '/health',
      corsDebug: '/cors-debug'
    },
    timestamp: new Date().toISOString()
  });
});

// Ping route - MUST work if Express is working
app.get('/ping', (_req, res) => {
  console.log('[PING] ✅ Route handler called!');
  res.json({ success: true, message: 'Ping works - Express is working', timestamp: new Date().toISOString() });
});

// Log route registration immediately
console.log('[ROUTES] ✅ Registered / route');
console.log('[ROUTES] ✅ Registered /ping route');

// CORS configuration - support both Production and Preview deployments
// PRODUCTION-READY: Supports multiple origins via environment variable
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
];

// Add CORS_ORIGIN from environment if provided (for compatibility with other projects)
if (process.env.CORS_ORIGIN) {
  const corsOrigin = process.env.CORS_ORIGIN.replace(/\/$/, ''); // Remove trailing slash
  if (!allowedOrigins.includes(corsOrigin)) {
    allowedOrigins.push(corsOrigin);
    console.log(`[CORS] Added CORS_ORIGIN to allowed origins: ${corsOrigin}`);
  }
}

// Add FRONTEND_URL from environment if provided
if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
  if (!allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl);
    console.log(`[CORS] Added FRONTEND_URL to allowed origins: ${frontendUrl}`);
  }
}

// Always allow production Vercel URL (if not already added)
const productionUrl = 'https://ai-store-frontend.vercel.app';
if (!allowedOrigins.includes(productionUrl)) {
  allowedOrigins.push(productionUrl);
}

// Log all allowed origins at startup
console.log(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);

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
  
  // Always log CORS requests for debugging (especially important in production)
  // CRITICAL: Log BEFORE processing to see all requests
  console.log(`[CORS] ${req.method} ${req.path} | Origin: ${origin || 'none'} | Time: ${new Date().toISOString()}`);
  
  // Determine if origin should be allowed
  let isAllowed = false;
  let allowedOrigin: string | null = null;
  let normalizedOrigin: string | null = null;
  
  if (!origin) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    isAllowed = true;
  } else {
    // Normalize origin (remove trailing slash and whitespace)
    normalizedOrigin = origin.trim().replace(/\/$/, '');
    
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
      // Additional security: Validate Vercel domain format
      // Pattern: https://[project-name][-hash][-user].vercel.app
      const vercelDomainPattern = /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*\.vercel\.app$/;
      
      if (vercelDomainPattern.test(normalizedOrigin)) {
        isAllowed = true;
        // CRITICAL: Use normalized origin (without trailing slash) to ensure exact match
        allowedOrigin = normalizedOrigin;
        console.log(`[CORS] ✅ Allowed Vercel origin: ${normalizedOrigin}`);
      } else {
        console.warn(`[CORS] ⚠️ Invalid Vercel domain format: ${normalizedOrigin}`);
      }
    }
  }
  
  // Set CORS headers for allowed origins
  if (isAllowed) {
    // If we have an allowed origin, set CORS headers
    if (allowedOrigin) {
      // CRITICAL: Set exact origin (required for credentials)
      // Remove any trailing slash to ensure exact match
      const cleanOrigin = allowedOrigin.trim().replace(/\/$/, '');
      res.setHeader('Access-Control-Allow-Origin', cleanOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
      res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
      
      // Always log CORS headers being set (critical for production debugging)
      console.log(`[CORS] ✅ Setting Access-Control-Allow-Origin: ${cleanOrigin} for ${req.method} ${req.path}`);
    }
    // If no origin (like curl, Postman), don't set CORS headers but allow the request
    
    // Handle preflight requests (OPTIONS) - MUST return early
    if (req.method === 'OPTIONS') {
      console.log(`[CORS] ✅ Preflight (OPTIONS) - returning 204 for origin: ${allowedOrigin || 'none'}`);
      res.status(204).end();
      return; // CRITICAL: Don't call next() for OPTIONS
    }
  } else if (origin) {
    // Reject blocked origins (but allow requests with no origin)
    console.warn(`[CORS] ❌ Blocked origin: ${origin}`);
    console.warn(`[CORS]    Normalized: ${normalizedOrigin}`);
    console.warn(`[CORS]    Allowed patterns: localhost, explicit origins, *.vercel.app`);
    console.warn(`[CORS]    Allowed origins: ${allowedOrigins.join(', ')}`);
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

// ============================================
// PUBLIC ROUTES (NO AUTH REQUIRED)
// ============================================
// IMPORTANT: These routes MUST be defined BEFORE API routes
// NOTE: /ping and / are already defined above (before CORS middleware)

// Health check
app.get('/health', (_req, res) => {
  console.log('[HEALTH] ✅ Route handler called!');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CORS debug - RIGHT AFTER /health to ensure it works
app.get('/cors-debug', (req, res) => {
  console.log('[CORS-DEBUG] ✅ Route handler called!');
  try {
    const origin = req.headers.origin;
    const normalizedOrigin = origin ? origin.trim().replace(/\/$/, '') : null;
    const isVercel = origin ? (normalizedOrigin?.startsWith('https://') && normalizedOrigin.endsWith('.vercel.app')) : false;
    const corsHeader = res.getHeader('Access-Control-Allow-Origin');
    
    res.json({
      success: true,
      message: 'CORS debug endpoint is working',
      origin: origin || 'none',
      normalizedOrigin: normalizedOrigin,
      isVercel: isVercel || false,
      allowedOrigins: allowedOrigins,
      frontendUrl: process.env.FRONTEND_URL || 'not set',
      corsOrigin: process.env.CORS_ORIGIN || 'not set',
      corsHeader: corsHeader || 'not set',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CORS-DEBUG] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Simple test - MUST work if /health works
app.get('/test-simple', (_req, res) => {
  console.log('[TEST-SIMPLE] ✅ Route handler called!');
  res.json({ success: true, message: 'Simple test works' });
});

// Simple test route to verify route registration
app.get('/test', (_req, res) => {
  console.log('[TEST] ✅ Route handler called!');
  res.json({ success: true, message: 'Test route works', timestamp: new Date().toISOString() });
});

// Alternative CORS debug endpoint (in case /cors-debug doesn't work)
app.get('/debug/cors', (req, res) => {
  console.log('[DEBUG/CORS] ✅ Route handler called!');
  try {
    const origin = req.headers.origin;
    const normalizedOrigin = origin ? origin.trim().replace(/\/$/, '') : null;
    const isVercel = origin ? (normalizedOrigin?.startsWith('https://') && normalizedOrigin.endsWith('.vercel.app')) : false;
    const corsHeader = res.getHeader('Access-Control-Allow-Origin');
    
    res.json({
      success: true,
      message: 'CORS debug endpoint (alternative) is working',
      origin: origin || 'none',
      normalizedOrigin: normalizedOrigin,
      isVercel: isVercel || false,
      allowedOrigins: allowedOrigins,
      frontendUrl: process.env.FRONTEND_URL || 'not set',
      corsOrigin: process.env.CORS_ORIGIN || 'not set',
      corsHeader: corsHeader || 'not set',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
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
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'not set',
      CORS_ORIGINS_COUNT: allowedOrigins.length,
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

// API Routes (all require authentication via router-level middleware)
// Serve uploaded files (static, no auth)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Protected API routes
app.use('/api/equipments', equipmentsRouter);
app.use('/api/consumption', consumptionRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/orders', ordersRouter);

// CRITICAL: Error handling (must be last)
// notFoundHandler will catch all unmatched routes
// IMPORTANT: Make sure all routes are defined BEFORE this line
app.use(notFoundHandler);
app.use(errorHandler);

// Log all registered routes for debugging
// CRITICAL: This runs at server startup, not at request time
console.log('📋 Registered routes (in order):');
console.log('  1. GET / (root)');
console.log('  2. GET /ping');
console.log('  3. GET /health');
console.log('  4. GET /cors-debug');
console.log('  5. GET /test-simple');
console.log('  6. GET /test');
console.log('  7. GET /debug/cors');
console.log('  8. GET /health/detailed');
console.log('  9. GET /api/equipments');
console.log(' 10. GET /api/consumption');
console.log(' 11. GET /api/notifications');
console.log(' 12. GET /api/predictions');
console.log(' 13. GET /api/orders');

// Start server with error handling
// CRITICAL: This is the entry point - must work on Railway
try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌐 CORS Configuration:`);
    console.log(`   - All Vercel *.vercel.app domains are allowed`);
    console.log(`   - Explicit allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`   - FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
    console.log(`   - CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'not set'}`);
    console.log(`   - Total allowed origins: ${allowedOrigins.length}`);
    console.log(`🔍 CORS Debug endpoint: http://0.0.0.0:${PORT}/cors-debug`);
    console.log(`✅ Test endpoints:`);
    console.log(`   - GET /ping`);
    console.log(`   - GET /health`);
    console.log(`   - GET /`);
    console.log('='.repeat(50));
  }).on('error', (err: NodeJS.ErrnoException) => {
    console.error('❌ Server startup error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error('❌ Unknown server error:', err.message);
      process.exit(1);
    }
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

export default app;
