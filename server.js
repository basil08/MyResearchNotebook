import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import admin from "firebase-admin";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
// For production, use service account key file or environment variables
// For now, we'll use the project ID to initialize
let firebaseAdminInitialized = false;
try {
  if (process.env.FIREBASE_PROJECT_ID) {
    // Initialize with project ID (works for token verification)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseAdminInitialized = true;
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️  FIREBASE_PROJECT_ID not set - token verification disabled');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.warn('⚠️  Token verification will be skipped');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Google Sheets API endpoint from environment
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_DB_URL;

/**
 * Middleware to verify Firebase auth token
 */
async function verifyAuthToken(req, res, next) {
  // Skip auth for health check
  if (req.path === '/health') {
    return next();
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Missing or invalid authorization token'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  // If Firebase Admin is not initialized, skip verification but require token presence
  if (!firebaseAdminInitialized) {
    console.warn('[Proxy] Firebase Admin not initialized - skipping token verification');
    // Still require token to be present (basic protection)
    if (!token || token.length < 10) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token format'
      });
    }
    return next();
  }

  // Verify token with Firebase Admin
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Attach user info to request for potential use
    req.user = decodedToken;
    console.log(`[Proxy] Authenticated user: ${decodedToken.email}`);
    next();
  } catch (error) {
    console.error('[Proxy] Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid or expired token'
    });
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Main proxy endpoint - handles all Google Sheets operations
// Protected with auth token verification
app.all("/api/proxy", verifyAuthToken, async (req, res) => {
  try {
    // Check if Google Sheets URL is configured
    if (!GOOGLE_SHEET_URL) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_SHEET_DB_URL is not configured on the server"
      });
    }

    console.log(`[Proxy] ${req.method} request to Google Sheets`);
    console.log(`[Proxy] Query params:`, req.query);
    console.log(`[Proxy] Body:`, req.body);

    // Build the target URL with query parameters
    const url = new URL(GOOGLE_SHEET_URL);
    
    // Forward all query parameters (for actions like update, delete)
    Object.keys(req.query).forEach(key => {
      url.searchParams.append(key, req.query[key]);
    });

    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add body for POST requests
    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log(`[Proxy] Forwarding to: ${url.toString()}`);

    // Make the request to Google Sheets
    const response = await fetch(url.toString(), fetchOptions);
    
    // Get the response text first to handle both JSON and text responses
    const responseText = await response.text();
    
    console.log(`[Proxy] Response status: ${response.status}`);
    console.log(`[Proxy] Response body:`, responseText);

    // Try to parse as JSON, fallback to text
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }

    // Forward the status code and data
    res.status(response.status).json(data);

  } catch (error) {
    console.error('[Proxy] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Proxy request failed",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /health - Health check",
      "GET /api/proxy - Fetch all logs",
      "POST /api/proxy - Create a new log",
      "POST /api/proxy?id=<id>&action=update - Update a log",
      "POST /api/proxy?id=<id>&action=delete - Delete a log"
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Google Sheets URL configured: ${GOOGLE_SHEET_URL ? '✅' : '❌'}`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`   GET  ${PORT === 3000 ? 'http://localhost:' + PORT : ''}/health`);
  console.log(`   GET  ${PORT === 3000 ? 'http://localhost:' + PORT : ''}/api/proxy`);
  console.log(`   POST ${PORT === 3000 ? 'http://localhost:' + PORT : ''}/api/proxy`);
});

export default app;

