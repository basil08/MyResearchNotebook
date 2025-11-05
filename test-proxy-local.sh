#!/bin/bash

# Test script for local proxy setup
# Run this after starting "vercel dev" or "netlify dev"

echo "🧪 Testing CORS Proxy Setup"
echo "================================"
echo ""

# Determine which dev server is running
if lsof -i:3000 > /dev/null 2>&1; then
    BASE_URL="http://localhost:3000"
    echo "✅ Detected Vercel dev server at $BASE_URL"
elif lsof -i:8888 > /dev/null 2>&1; then
    BASE_URL="http://localhost:8888"
    echo "✅ Detected Netlify dev server at $BASE_URL"
else
    echo "❌ No dev server detected!"
    echo ""
    echo "Please start a dev server first:"
    echo "  vercel dev    (for Vercel)"
    echo "  netlify dev   (for Netlify)"
    exit 1
fi

echo ""
echo "📍 Testing endpoints..."
echo ""

# Test 1: Health Check
echo "1️⃣  Testing /api/health..."
HTTP_CODE=$(curl -s -o /tmp/health_response.json -w "%{http_code}" "$BASE_URL/api/health")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Health check passed (HTTP $HTTP_CODE)"
    cat /tmp/health_response.json | jq '.' 2>/dev/null || cat /tmp/health_response.json
else
    echo "   ❌ Health check failed (HTTP $HTTP_CODE)"
    cat /tmp/health_response.json
fi

echo ""

# Test 2: CORS Headers (OPTIONS)
echo "2️⃣  Testing CORS preflight (OPTIONS)..."
CORS_HEADER=$(curl -s -X OPTIONS "$BASE_URL/api/proxy" -I | grep -i "access-control-allow-origin")

if [ -n "$CORS_HEADER" ]; then
    echo "   ✅ CORS headers present"
    echo "   $CORS_HEADER"
else
    echo "   ❌ CORS headers missing!"
fi

echo ""

# Test 3: Proxy GET Request
echo "3️⃣  Testing proxy GET request..."
HTTP_CODE=$(curl -s -o /tmp/proxy_response.json -w "%{http_code}" "$BASE_URL/api/proxy")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Proxy GET passed (HTTP $HTTP_CODE)"
    echo "   Response preview:"
    cat /tmp/proxy_response.json | jq '.' 2>/dev/null | head -20 || cat /tmp/proxy_response.json | head -20
elif [ "$HTTP_CODE" = "500" ]; then
    echo "   ⚠️  Proxy returned 500 - Check if GOOGLE_SHEET_DB_URL is set"
    cat /tmp/proxy_response.json | jq '.' 2>/dev/null || cat /tmp/proxy_response.json
else
    echo "   ❌ Proxy GET failed (HTTP $HTTP_CODE)"
    cat /tmp/proxy_response.json
fi

echo ""
echo "================================"
echo "✅ Test complete!"
echo ""
echo "Next steps:"
echo "1. If all tests passed, run: npm run web"
echo "2. Open http://localhost:8081 and try creating a log"
echo "3. Check browser console for: [ResearchLogService] Platform: web"

