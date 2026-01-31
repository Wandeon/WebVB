#!/bin/bash
# scripts/audit/check-security-headers.sh
# Verify security headers are present

URL="${1:-http://100.120.125.83}"

echo "Checking security headers for $URL"
echo "=================================="

HEADERS=$(curl -sI "$URL")

check_header() {
  local header=$1
  if echo "$HEADERS" | grep -qi "$header"; then
    echo "✅ $header: PRESENT"
  else
    echo "❌ $header: MISSING"
  fi
}

check_header "X-Content-Type-Options"
check_header "X-Frame-Options"
check_header "X-XSS-Protection"
check_header "Referrer-Policy"
check_header "Content-Security-Policy"
check_header "Permissions-Policy"

echo ""
echo "Full headers:"
echo "$HEADERS"
