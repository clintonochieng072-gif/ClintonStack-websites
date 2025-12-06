import axios from 'axios';
import { Buffer } from 'buffer';

// TypeScript interfaces for M-Pesa API responses

interface AccessTokenResponse {
  access_token: string;
  expires_in: string;
}

interface STKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface STKQueryRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  CheckoutRequestID: string;
}

interface STKQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

interface CallbackData {
  stkCallback: {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    CallbackMetadata?: {
      Item: Array<{
        Name: string;
        Value: string | number;
      }>;
    };
  };
}

// Utility functions for M-Pesa integration

function generateTimestamp(): string {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  );
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  const data = shortcode + passkey + timestamp;
  return Buffer.from(data).toString('base64');
}

async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get<AccessTokenResponse>(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return response.data.access_token;
}

async function initiateSTKPush(
  accessToken: string,
  shortcode: string,
  passkey: string,
  amount: number,
  phoneNumber: string,
  accountReference: string,
  transactionDesc: string,
  callbackUrl: string
): Promise<STKPushResponse> {
  const timestamp = generateTimestamp();
  const password = generatePassword(shortcode, passkey, timestamp);

  const requestData: STKPushRequest = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  const response = await axios.post<STKPushResponse>(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    requestData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

async function querySTKPush(
  accessToken: string,
  shortcode: string,
  passkey: string,
  checkoutRequestId: string
): Promise<STKQueryResponse> {
  const timestamp = generateTimestamp();
  const password = generatePassword(shortcode, passkey, timestamp);

  const requestData: STKQueryRequest = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await axios.post<STKQueryResponse>(
    'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
    requestData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

function handleCallback(callbackData: CallbackData): { success: boolean; message: string; metadata?: any } {
  const { stkCallback } = callbackData;

  if (stkCallback.ResultCode === 0) {
    // Success
    const metadata = stkCallback.CallbackMetadata?.Item.reduce((acc, item) => {
      acc[item.Name] = item.Value;
      return acc;
    }, {} as Record<string, string | number>);

    return { success: true, message: stkCallback.ResultDesc, metadata };
  } else {
    return { success: false, message: stkCallback.ResultDesc };
  }
}

export {
  getAccessToken,
  initiateSTKPush,
  querySTKPush,
  handleCallback,
  type AccessTokenResponse,
  type STKPushRequest,
  type STKPushResponse,
  type STKQueryRequest,
  type STKQueryResponse,
  type CallbackData,
};