#!/bin/bash

# PayHero Subscription Renewal Cron Job Setup
# This script sets up a daily cron job to process subscription renewals

# Add to crontab (run daily at 2 AM)
# 0 2 * * * curl -X POST https://clinton-stack-websites.vercel.app/api/billing/renewals

# For local development testing:
# curl -X POST http://localhost:3000/api/billing/renewals

# Check renewal status:
# curl https://clinton-stack-websites.vercel.app/api/billing/renewals

echo "PayHero Subscription Renewal Cron Job Setup"
echo "=========================================="
echo ""
echo "To set up automatic subscription renewals, add this to your crontab:"
echo "0 2 * * * curl -X POST https://clinton-stack-websites.vercel.app/api/billing/renewals"
echo ""
echo "This will run daily at 2 AM and process all expired subscriptions."
echo ""
echo "For Vercel deployment, use Vercel Cron Jobs:"
echo "https://vercel.com/docs/cron-jobs"
echo ""
echo "Example Vercel cron job configuration in vercel.json:"
echo '{
  "crons": [
    {
      "path": "/api/billing/renewals",
      "schedule": "0 2 * * *"
    }
  ]
}'
echo ""
echo "Or configure in Vercel dashboard under Project Settings > Functions > Cron Jobs"