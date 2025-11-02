/**
 * CORS Proxy for Google Sheets API
 * 
 * Vercel Serverless Function
 * This acts as a proxy between your web app and Google Sheets,
 * adding the necessary CORS headers that Google Apps Script doesn't provide.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_DB_URL;

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper function to make HTTP requests
function makeRequest(url, options, postData) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

module.exports = async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.end();
  }

  // Verify Google Sheets URL is configured
  if (!GOOGLE_SHEET_URL) {
    res.status(500);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.json({
      error: 'GOOGLE_SHEET_DB_URL not configured',
      message: 'Please set the GOOGLE_SHEET_DB_URL environment variable'
    });
  }

  try {
    // Extract query parameters (for update/delete operations)
    const queryParams = new URLSearchParams(req.query).toString();
    const targetUrl = queryParams 
      ? `${GOOGLE_SHEET_URL}?${queryParams}`
      : GOOGLE_SHEET_URL;

    // Prepare request options
    const requestOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Prepare body for POST requests
    let postData = null;
    if (req.method === 'POST' && req.body) {
      postData = JSON.stringify(req.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    // Forward request to Google Sheets
    console.log(`[PROXY] ${req.method} ${targetUrl}`);
    const response = await makeRequest(targetUrl, requestOptions, postData);

    // Parse response data
    let data;
    try {
      data = JSON.parse(response.body);
    } catch (e) {
      data = { raw: response.body };
    }

    // Return with CORS headers
    res.status(response.statusCode || 200);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.json(data);

  } catch (error) {
    console.error('[PROXY] Error:', error);
    
    // Return error with CORS headers
    res.status(500);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.json({
      error: 'Proxy error',
      message: error.message,
      details: error.toString()
    });
  }
};

