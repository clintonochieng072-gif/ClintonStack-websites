# ClintonStack Affiliate Withdrawal System

This document provides a complete implementation of the affiliate withdrawal system for ClintonStack, including database schemas, APIs, cron jobs, and frontend components.

## Overview

The affiliate withdrawal system allows affiliates to withdraw their earnings through M-Pesa with the following key features:

- **7-day holding period**: Commissions are held for 7 days before becoming available for withdrawal
- **M-Pesa integration**: Direct payouts to Safaricom M-Pesa numbers
- **Admin approval**: Withdrawals require admin approval before processing
- **Rate limiting**: One withdrawal per day per affiliate
- **Minimum withdrawal**: KES 300 minimum
- **Real-time countdown**: Shows when pending balance becomes available

## Database Schema Changes

### User Model Updates

Updated the User model with simplified affiliate fields:

```typescript
// Affiliate fields
referralCode?: string;
availableBalance?: number; // Real money only - immediately available
totalEarned?: number;
withdrawalHistory?: {
  withdrawalId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  requestedAt: Date;
  processedAt?: Date;
  phoneNumber?: string;
}[];
```

### Updated WithdrawalRequest Model

```typescript
interface IWithdrawalRequest {
  userId: string;
  phoneNumber: string; // Kenyan M-Pesa number with validation
  amount: number; // Minimum 200 KES
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
}
```

## API Endpoints

### Affiliate APIs

#### `POST /api/affiliate/withdraw`

Creates a withdrawal request.

**Request Body:**

```json
{
  "amount": 500,
  "phoneNumber": "0712345678"
}
```

**Response:**

```json
{
  "message": "Withdrawal request submitted successfully",
  "withdrawalId": "..."
}
```

**Features:**

- Validates minimum amount (KES 300)
- Validates Kenyan phone number format
- Rate limiting: one withdrawal per 24 hours
- Deducts from available balance immediately

#### `GET /api/affiliate/balance`

Retrieves affiliate balance information.

**Response:**

```json
{
  "pendingBalance": 1500,
  "availableBalance": 2500,
  "totalEarned": 4000,
  "nextReleaseTime": "2025-12-09T00:00:00.000Z",
  "withdrawalHistory": [...]
}
```

### Admin APIs

#### `POST /api/admin/withdrawals/approve`

Approves or rejects a withdrawal request.

**Request Body:**

```json
{
  "withdrawalId": "...",
  "action": "approve" // or "reject"
}
```

**Features:**

- Triggers IntaSend M-Pesa payout on approval
- Updates withdrawal status and user balance
- Logs all transactions

#### `GET /api/admin/withdrawals/list`

Lists withdrawal requests with filtering and pagination.

**Query Parameters:**

- `status`: "pending" | "completed" | "failed" | "all"
- `page`: number (default: 1)
- `limit`: number (default: 20)

### Cron Job API

#### `GET /api/cron/release-pending-earnings`

Releases pending earnings older than 7 days (for Vercel cron).

## Background Jobs

### Cron Job Setup

The system includes a cron job that runs daily to release pending earnings:

```typescript
// Runs every midnight
cron.schedule("0 0 * * *", () => {
  releasePendingEarnings();
});
```

#### For Development

Run manually:

```bash
npm run release-pending-earnings
```

#### For Production (Vercel)

Set up a cron job to call:

```
GET https://your-domain.com/api/cron/release-pending-earnings
```

## IntaSend Integration

### Environment Variables Required

```env
INTASEND_PUBLIC_KEY=your_public_key
INTASEND_SECRET_KEY=your_secret_key
INTASEND_WALLET_ID=your_wallet_id
CRON_SECRET=your_cron_secret
```

### Payout Flow

1. Admin approves withdrawal
2. System calls IntaSend Disbursement API
3. Money is sent to affiliate's M-Pesa number
4. Status updated based on API response
5. Transaction ID stored for tracking

## Frontend Components

### Affiliate Dashboard Updates

The affiliate dashboard (`/dashboard/affiliate`) now includes:

- **Balance Cards**: Pending, Available, Total Earned
- **Countdown Timer**: Shows time until pending balance is released
- **Withdrawal Form**: Phone number input and submit button
- **Withdrawal History**: Table of all withdrawal requests

### Admin Dashboard

New admin page (`/admin/withdrawals`) with:

- **Statistics Cards**: Pending, Completed, Failed, Total Paid
- **Filter Tabs**: Filter by status
- **Withdrawal Table**: Approve/Reject actions
- **User Details**: Affiliate information for each request

## Commission Crediting

When a user pays for a subscription, if they have a referrer:

1. Commission is calculated (10% of payment amount)
2. Added to affiliate's `pendingEarnings` array
3. `totalEarned` is updated
4. Referral status updated to "paid"

## Security Features

- **Phone Validation**: Kenyan M-Pesa number format validation
- **Rate Limiting**: One withdrawal per day per affiliate
- **Amount Validation**: Minimum KES 300
- **Admin Authentication**: All admin actions require authentication
- **Transaction Logging**: All withdrawals are logged

## Setup Instructions

### 1. Install Dependencies

```bash
npm install node-cron @types/node-cron tsx
```

### 2. Environment Variables

Add to your `.env.local`:

```env
INTASEND_PUBLIC_KEY=your_intasend_public_key
INTASEND_SECRET_KEY=your_intasend_secret_key
INTASEND_WALLET_ID=your_wallet_id
CRON_SECRET=your_secure_cron_secret
```

### 3. Database Migration

The User model will automatically add new fields. For existing users, you may need to:

```javascript
// Run in MongoDB shell or create a migration script
db.users.updateMany(
  { role: "affiliate" },
  {
    $set: {
      pendingEarnings: [],
      availableBalance: 0,
      totalEarned: 0,
      withdrawalHistory: [],
    },
  }
);
```

### 4. Cron Job Setup

#### For Development

The cron job is initialized but not scheduled. Run manually or modify to schedule.

#### For Vercel

1. Go to Vercel dashboard → Your project → Settings → Functions
2. Add cron job:
   - Path: `/api/cron/release-pending-earnings`
   - Schedule: `0 0 * * *` (daily at midnight)
   - Method: GET

### 5. Testing

1. Create an affiliate user
2. Add earnings to their `pendingEarnings`
3. Wait or manually run the release script
4. Test withdrawal request from affiliate dashboard
5. Test approval from admin dashboard

## File Structure

```
src/
├── lib/
│   ├── models/
│   │   ├── User.ts (updated)
│   │   └── WithdrawalRequest.ts (new)
│   ├── intasend.ts (updated with payout)
│   ├── cron.ts (new)
│   └── logger.ts (new)
├── app/
│   ├── api/
│   │   ├── affiliate/
│   │   │   ├── withdraw/route.ts (updated)
│   │   │   └── balance/route.ts (new)
│   │   ├── admin/
│   │   │   └── withdrawals/
│   │   │       ├── approve/route.ts (new)
│   │   │       └── list/route.ts (new)
│   │   └── cron/
│   │       └── release-pending-earnings/route.ts (new)
│   ├── dashboard/
│   │   └── affiliate/
│   │       └── page.tsx (updated)
│   └── admin/
│       └── withdrawals/
│           └── page.tsx (new)
└── lib/
    └── db/
        └── subscription.ts (updated)
```

## Monitoring and Maintenance

### Logs

All withdrawal activities are logged. Check your server logs for:

- Withdrawal requests
- Approval/rejection actions
- Payout successes/failures
- Cron job executions

### Database Queries

Useful queries for monitoring:

```javascript
// Count pending withdrawals
db.withdrawalrequests.count({ status: "pending" });

// Total paid out
db.withdrawalrequests.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, total: { $sum: "$amount" } } },
]);
```

## Troubleshooting

### Common Issues

1. **Cron job not running**: Check Vercel cron configuration
2. **Payout failures**: Verify IntaSend credentials and wallet balance
3. **Phone validation errors**: Ensure Kenyan number format (07XXXXXXXX or +2547XXXXXXXX)
4. **Insufficient balance**: Check affiliate's availableBalance vs requested amount

### Support

For IntaSend API issues, refer to: https://developers.intasend.com/

This implementation provides a complete, production-ready affiliate withdrawal system with proper security, validation, and monitoring.
