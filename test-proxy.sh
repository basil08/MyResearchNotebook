#!/bin/bash

# Test script for the proxy server
# Usage: ./test-proxy.sh [URL]
# Example: ./test-proxy.sh http://localhost:3000
# Example: ./test-proxy.sh https://your-app.vercel.app

URL="${1:-http://localhost:3000}"

echo "🧪 Testing Proxy Server at: $URL"
echo "================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "$URL/health")
echo "Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo ""
echo "================================="
echo ""

# Test 2: Get All Logs
echo "2️⃣  Testing GET /api/proxy (fetch all logs)..."
GET_RESPONSE=$(curl -s "$URL/api/proxy")
echo "Response: $GET_RESPONSE"

if [ -n "$GET_RESPONSE" ]; then
    echo "✅ GET request successful!"
else
    echo "❌ GET request failed!"
fi

echo ""
echo "================================="
echo ""

# Test 3: Create a Log (optional - commented out to avoid cluttering your sheet)
echo "3️⃣  Testing POST /api/proxy (create log)..."
echo "⚠️  Skipping to avoid test data in your sheet"
echo "To test POST, uncomment the code in this script"

# Uncomment below to test POST
# TEST_ID="test-$(date +%s)"
# POST_DATA='{
#   "id": "'$TEST_ID'",
#   "created_by": "test-user",
#   "date": "2024-11-08",
#   "plan_to_read": "Test reading",
#   "did_read": "Test completed",
#   "learned_today": "Testing proxy works!",
#   "new_thoughts": "This is a test",
#   "coded_today": "Proxy testing",
#   "wrote_or_taught": "Test documentation",
#   "try_tomorrow": "Deploy to production"
# }'
# 
# POST_RESPONSE=$(curl -s -X POST "$URL/api/proxy" \
#   -H "Content-Type: application/json" \
#   -d "$POST_DATA")
# 
# echo "Response: $POST_RESPONSE"
# 
# if echo "$POST_RESPONSE" | grep -q "success"; then
#     echo "✅ POST request successful!"
# else
#     echo "❌ POST request failed!"
# fi

echo ""
echo "================================="
echo "🎉 Proxy server tests complete!"
echo "================================="

