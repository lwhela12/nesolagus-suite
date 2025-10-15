#!/bin/bash

###############################################################################
# Test Client Survey Locally
#
# Starts the engine with a specific client configuration for local testing.
#
# Usage:
#   ./scripts/test-client.sh <client-slug>
#   ./scripts/test-client.sh acme
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check if client slug provided
if [ -z "$1" ]; then
  print_error "Client slug is required"
  echo ""
  echo "Usage: ./scripts/test-client.sh <client-slug>"
  echo ""
  echo "Examples:"
  echo "  ./scripts/test-client.sh acme"
  echo "  ./scripts/test-client.sh beta-corp"
  echo ""
  exit 1
fi

CLIENT_SLUG=$1
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
CONFIG_PATH="$ROOT_DIR/engine/config/clients/$CLIENT_SLUG.json"

echo ""
print_info "Testing Survey for Client: $CLIENT_SLUG"
echo ""

# Check if config exists
if [ ! -f "$CONFIG_PATH" ]; then
  print_error "Config not found: $CONFIG_PATH"
  echo ""
  echo "Available clients:"
  ls -1 "$ROOT_DIR/engine/config/clients/" | grep ".json" | sed 's/.json$//'
  echo ""
  echo "Generate a new survey with:"
  echo "  npm run generate -- --client \"Client Name\" --discovery ... --methodology ..."
  exit 1
fi

print_success "Config found: $CONFIG_PATH"
echo ""

# Display config summary
if command -v jq &> /dev/null; then
  SURVEY_NAME=$(jq -r '.survey.name' "$CONFIG_PATH")
  BLOCKS_COUNT=$(jq '.blocks | length' "$CONFIG_PATH")
  DURATION=$(jq -r '.survey.metadata.estimatedMinutes' "$CONFIG_PATH")

  print_info "Survey Details:"
  echo "   Name: $SURVEY_NAME"
  echo "   Blocks: $BLOCKS_COUNT"
  echo "   Duration: ${DURATION} minutes"
  echo ""
fi

# Set environment variables
export CLIENT_ID=$CLIENT_SLUG
export NODE_ENV=development

print_info "Starting engine with CLIENT_ID=$CLIENT_SLUG"
echo ""
print_warning "Frontend: http://localhost:5173"
print_warning "Backend:  http://localhost:4001"
echo ""
print_info "Press Ctrl+C to stop"
echo ""
echo "────────────────────────────────────────────────────────"
echo ""

# Start the engine (use dev:local to avoid Docker and pass env vars)
cd "$ROOT_DIR/engine"
npm run dev:local
