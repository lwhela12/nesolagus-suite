#!/bin/bash

###############################################################################
# Deploy Client Survey to Vercel
#
# Deploys the engine with a client-specific configuration to Vercel.
#
# Usage:
#   ./scripts/deploy-client.sh <client-slug> [--preview]
#   ./scripts/deploy-client.sh acme
#   ./scripts/deploy-client.sh acme --preview
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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  print_error "Vercel CLI not found"
  echo ""
  echo "Install it with: npm install -g vercel"
  exit 1
fi

# Check if client slug provided
if [ -z "$1" ]; then
  print_error "Client slug is required"
  echo ""
  echo "Usage: ./scripts/deploy-client.sh <client-slug> [--preview]"
  echo ""
  echo "Examples:"
  echo "  ./scripts/deploy-client.sh acme            # Deploy to production"
  echo "  ./scripts/deploy-client.sh acme --preview  # Deploy preview"
  echo ""
  exit 1
fi

CLIENT_SLUG=$1
ENVIRONMENT="production"

# Check for preview flag
if [ "$2" = "--preview" ]; then
  ENVIRONMENT="preview"
fi

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
CONFIG_PATH="$ROOT_DIR/engine/config/clients/$CLIENT_SLUG.json"

echo ""
print_info "Deploying Survey for Client: $CLIENT_SLUG"
print_info "Environment: $ENVIRONMENT"
echo ""

# Check if config exists
if [ ! -f "$CONFIG_PATH" ]; then
  print_error "Config not found: $CONFIG_PATH"
  echo ""
  echo "Available clients:"
  ls -1 "$ROOT_DIR/engine/config/clients/" | grep ".json" | sed 's/.json$//'
  echo ""
  exit 1
fi

print_success "Config found: $CONFIG_PATH"

# Display config summary
if command -v jq &> /dev/null; then
  SURVEY_NAME=$(jq -r '.survey.name' "$CONFIG_PATH")
  BLOCKS_COUNT=$(jq '.blocks | length' "$CONFIG_PATH")
  DURATION=$(jq -r '.survey.metadata.estimatedMinutes' "$CONFIG_PATH")
  DASHBOARD_WIDGETS=$(jq '(.dashboard.widgets // []) | length' "$CONFIG_PATH")

  echo ""
  print_info "Survey Details:"
  echo "   Name: $SURVEY_NAME"
  echo "   Blocks: $BLOCKS_COUNT"
  echo "   Duration: ${DURATION} minutes"
  echo "   Dashboard Widgets: $DASHBOARD_WIDGETS"

  if [ "$DASHBOARD_WIDGETS" -eq 0 ]; then
    print_warning "Dashboard has no widgets. Studio dashboard builder can add analytics before deploy."
  fi
fi

echo ""
print_warning "This will deploy the engine to Vercel with CLIENT_ID=$CLIENT_SLUG"

# Confirmation prompt for production
if [ "$ENVIRONMENT" = "production" ]; then
  echo ""
  read -p "Deploy to PRODUCTION? (yes/no): " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    print_info "Deployment cancelled"
    exit 0
  fi
fi

echo ""
print_info "Starting deployment..."
echo ""

# Change to engine directory
cd "$ROOT_DIR/engine"

# Build vercel CLI command
VERCEL_CMD="vercel"

# Add production flag if not preview
if [ "$ENVIRONMENT" = "production" ]; then
  VERCEL_CMD="$VERCEL_CMD --prod"
fi

# Add environment variables
VERCEL_CMD="$VERCEL_CMD --env CLIENT_ID=$CLIENT_SLUG"

# Check if .env.production exists and load additional vars
if [ -f ".env.production" ]; then
  print_info "Loading environment variables from .env.production"
  # You can add additional env vars here
fi

echo ""
print_info "Running: $VERCEL_CMD"
echo ""
echo "────────────────────────────────────────────────────────"
echo ""

# Run deployment
$VERCEL_CMD

echo ""
echo "────────────────────────────────────────────────────────"
echo ""
print_success "Deployment complete!"
echo ""
print_info "Next steps:"
echo "   1. Test the deployed survey"
echo "   2. Check Vercel dashboard for logs"
echo "   3. Monitor for any errors"
echo ""

# Note about environment variables
if [ "$ENVIRONMENT" = "production" ]; then
  print_warning "Important: Ensure CLIENT_ID=$CLIENT_SLUG is set in Vercel project settings"
  print_warning "Go to: Vercel Dashboard → Project → Settings → Environment Variables"
fi

echo ""
