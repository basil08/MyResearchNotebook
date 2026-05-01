/**
 * Netlify Function - CORS Proxy for Google Sheets (Apps Script) API
 *
 * Forwards GET/POST requests from the web app to the Google Apps Script
 * endpoint, adds CORS headers, and verifies the caller's Firebase ID token.
 */

import admin from 'firebase-admin';

const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_DB_URL;

let firebaseAdminInitialized = false;
try {
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseAdminInitialized = true;
    console.log('[PROXY] Firebase Admin initialized');
  } else if (admin.apps.length) {
    firebaseAdminInitialized = true;
  } else {
    console.warn('[PROXY] FIREBASE_PROJECT_ID not set - token verification disabled');
  }
} catch (error) {
  console.error('[PROXY] Failed to initialize Firebase Admin:', error.message);
}

async function verifyAuthToken(token) {
  if (!firebaseAdminInitialized) {
    if (!token || token.length < 10) {
      throw new Error('Invalid token format');
    }
    return { email: 'unknown' };
  }
  return await admin.auth().verifyIdToken(token);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (!GOOGLE_SHEET_URL) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'GOOGLE_SHEET_DB_URL not configured',
        message: 'Set GOOGLE_SHEET_DB_URL in the Netlify site environment variables.',
      }),
    };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Unauthorized - Missing or invalid authorization token',
      }),
    };
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    await verifyAuthToken(token);
  } catch (error) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Unauthorized - ' + error.message,
      }),
    };
  }

  try {
    const queryParams = event.queryStringParameters
      ? new URLSearchParams(event.queryStringParameters).toString()
      : '';

    const targetUrl = queryParams ? `${GOOGLE_SHEET_URL}?${queryParams}` : GOOGLE_SHEET_URL;

    const fetchOptions = {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
    };

    if (event.httpMethod === 'POST' && event.body) {
      fetchOptions.body = event.body;
    }

    console.log(`[PROXY] ${event.httpMethod} ${targetUrl}`);
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    return {
      statusCode: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: data,
    };
  } catch (error) {
    console.error('[PROXY] Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Proxy error',
        message: error.message,
      }),
    };
  }
};
