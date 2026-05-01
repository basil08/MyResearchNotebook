/**
 * Netlify Function - Health check endpoint
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ok',
      proxy: 'running',
      googleSheetsConfigured: !!process.env.GOOGLE_SHEET_DB_URL,
      firebaseConfigured: !!process.env.FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString(),
      platform: 'netlify-function',
    }),
  };
};
