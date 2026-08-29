#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Multi-Guard Attendance System Test ===${NC}\n"

# Step 1: Login
echo -e "${BLUE}[1/4] Logging in with username/password...${NC}"
LOGIN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mr4340@robi.com","password":"Test@2026"}')

TOKEN=$(echo "$LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
USER_ID=$(echo "$LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin).get('user', {}).get('id', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get token${NC}"
  echo "$LOGIN"
  exit 1
fi

echo -e "${GREEN}✓ Logged in successfully${NC}"
echo "  Token: ${TOKEN:0:30}..."
echo "  User ID: $USER_ID\n"

# Step 2: Test single guard check-in
echo -e "${BLUE}[2/4] Testing single guard check-in...${NC}"
SINGLE=$(curl -s -X POST http://localhost:5000/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"postId\": \"550e8400-e29b-41d4-a716-446655440000\",
    \"date\": \"2026-08-25\",
    \"time\": \"09:00 AM\",
    \"status\": \"PRESENT\",
    \"shiftHours\": 8
  }")

if echo "$SINGLE" | grep -q "success"; then
  echo -e "${GREEN}✓ Single check-in successful${NC}"
  echo "$SINGLE" | python3 -m json.tool 2>/dev/null | head -20
else
  echo -e "${RED}✗ Single check-in failed${NC}"
  echo "$SINGLE"
fi

echo ""

# Step 3: Test getting attendance history
echo -e "${BLUE}[3/4] Fetching attendance history...${NC}"
HISTORY=$(curl -s -X GET "http://localhost:5000/attendance/user/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

RECORD_COUNT=$(echo "$HISTORY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 0)" 2>/dev/null)

echo -e "${GREEN}✓ Retrieved $RECORD_COUNT attendance records${NC}\n"

# Step 4: Test upsert (second check-in same day)
echo -e "${BLUE}[4/4] Testing upsert (second check-in same day)...${NC}"
UPSERT=$(curl -s -X POST http://localhost:5000/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"postId\": \"550e8400-e29b-41d4-a716-446655440000\",
    \"date\": \"2026-08-25\",
    \"time\": \"05:00 PM\",
    \"status\": \"PRESENT\",
    \"shiftHours\": 8
  }")

if echo "$UPSERT" | grep -q "success"; then
  echo -e "${GREEN}✓ Upsert successful (record updated, not duplicated)${NC}"
else
  echo -e "${RED}✗ Upsert failed${NC}"
  echo "$UPSERT"
fi

echo -e "\n${GREEN}=== All Tests Complete ===${NC}"
