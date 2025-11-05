#!/bin/bash

# Quick test script for serverless functions
# Run this while vercel dev is running

echo "🧪 Testing Serverless Functions"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

echo "1️⃣  Testing /api/health..."
echo ""
curl -s "$BASE_URL/api/health" | jq '.' || curl -s "$BASE_URL/api/health"
echo ""
echo ""

echo "2️⃣  Testing /api/proxy OPTIONS (CORS preflight)..."
echo ""
curl -s -X OPTIONS "$BASE_URL/api/proxy" -v 2>&1 | grep -i "access-control" || echo "No CORS headers found"
echo ""
echo ""

echo "3️⃣  Testing /api/proxy GET..."
echo ""
RESPONSE=$(curl -s "$BASE_URL/api/proxy")
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""
echo ""

echo "================================"
echo "✅ Tests complete!"
echo ""
echo "If health shows 'ok' and proxy returns data,"
echo "then open http://localhost:3000 in your browser!"

