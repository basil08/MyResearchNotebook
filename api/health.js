/**
 * Health check endpoint for the proxy API
 * Vercel Serverless Function
 */

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isConfigured = !!process.env.GOOGLE_SHEET_DB_URL;

  res.status(200).json({
    status: 'ok',
    proxy: 'running',
    googleSheetsConfigured: isConfigured,
    timestamp: new Date().toISOString(),
    platform: 'vercel-serverless'
  });
};

