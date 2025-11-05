/**
 * Netlify Function - Health check endpoint
 */

exports.handler = async function(event, context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  const isConfigured = !!process.env.GOOGLE_SHEET_DB_URL;

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'ok',
      proxy: 'running',
      googleSheetsConfigured: isConfigured,
      timestamp: new Date().toISOString(),
      platform: 'netlify-function'
    })
  };
};

