/**
 * Netlify Function - CORS Proxy for Google Sheets API
 * 
 * This function acts as a proxy between your web app and Google Sheets,
 * adding the necessary CORS headers.
 */

const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_DB_URL;

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

exports.handler = async function(event, context) {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Verify Google Sheets URL is configured
  if (!GOOGLE_SHEET_URL) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'GOOGLE_SHEET_DB_URL not configured',
        message: 'Please set the GOOGLE_SHEET_DB_URL environment variable'
      })
    };
  }

  try {
    // Extract query parameters
    const queryParams = event.queryStringParameters 
      ? new URLSearchParams(event.queryStringParameters).toString()
      : '';
    
    const targetUrl = queryParams 
      ? `${GOOGLE_SHEET_URL}?${queryParams}`
      : GOOGLE_SHEET_URL;

    // Prepare fetch options
    const fetchOptions = {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST requests
    if (event.httpMethod === 'POST' && event.body) {
      fetchOptions.body = event.body;
    }

    // Forward request to Google Sheets
    console.log(`[PROXY] ${event.httpMethod} ${targetUrl}`);
    const response = await fetch(targetUrl, fetchOptions);

    // Get response data
    const data = await response.text();

    // Return with CORS headers
    return {
      statusCode: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: data
    };

  } catch (error) {
    console.error('[PROXY] Error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Proxy error',
        message: error.message,
        details: error.toString()
      })
    };
  }
};

