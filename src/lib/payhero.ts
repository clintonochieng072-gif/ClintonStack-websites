import axios from "axios";

interface PayHeroConfig {
  apiUsername: string;
  apiPassword: string;
  baseUrl: string;
  channelId: number;
  webhookSecret?: string;
}

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

interface STKPushResponse {
  success: boolean;
  message: string;
  data?: {
    checkoutRequestId: string;
    responseCode: string;
    responseDescription: string;
    customerMessage: string;
  };
}

interface PaymentStatusResponse {
  success: boolean;
  message: string;
  data?: {
    checkoutRequestId: string;
    status: "success" | "failed" | "pending";
    resultCode?: string;
    resultDesc?: string;
    callbackMetadata?: any;
  };
}

interface WebhookPayload {
  transactionId: string;
  amount: number;
  phoneNumber: string;
  status: "success" | "failed";
  accountReference: string;
  transactionDesc: string;
  callbackMetadata?: any;
}

class PayHeroService {
  private config: PayHeroConfig;

  constructor(config: PayHeroConfig) {
    this.config = config;
  }

  private getAuthConfig() {
    // PayHero uses Basic Auth with username/password
    return {
      username: this.config.apiUsername,
      password: this.config.apiPassword,
    };
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const payload = {
        amount: request.amount.toString(),
        phone_number: request.phoneNumber,
        channel_id: this.config.channelId,
        provider: "mpesa",
        reference: request.accountReference,
        transaction_desc: request.transactionDesc,
        callback_url:
          request.callbackUrl ||
          `${process.env.FRONTEND_URL}/api/billing/webhook`,
      };

      console.log("PayHero STK Push Request:");
      console.log("URL:", `${this.config.baseUrl}/payments`);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Channel ID:", this.config.channelId);

      const response = await axios.post(
        `${this.config.baseUrl}/payments`,
        payload,
        {
          auth: this.getAuthConfig(),
        }
      );

      console.log("PayHero STK Push Response:", response.data);

      return {
        success: true,
        message: "STK Push initiated successfully",
        data: {
          checkoutRequestId:
            response.data.CheckoutRequestID ||
            response.data.checkout_request_id ||
            response.data.id,
          responseCode: response.data.response_code || response.data.code,
          responseDescription:
            response.data.response_description || response.data.message,
          customerMessage:
            response.data.customer_message || response.data.message,
        },
      };
    } catch (error: any) {
      console.error("PayHero STK Push error:");
      console.error("Message:", error.message);
      console.error("Status Code:", error.response?.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error("Full Error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to initiate STK Push",
      };
    }
  }

  async checkPaymentStatus(
    checkoutRequestId: string
  ): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/payments/${checkoutRequestId}`,
        {
          auth: this.getAuthConfig(),
        }
      );

      const data = response.data;

      return {
        success: true,
        message: "Payment status retrieved successfully",
        data: {
          checkoutRequestId,
          status: data.status,
          resultCode: data.result_code,
          resultDesc: data.result_desc,
          callbackMetadata: data.callback_metadata,
        },
      };
    } catch (error: any) {
      console.error(
        "PayHero status check error:",
        error.response?.data || error.message
      );

      // If endpoint not found, assume status is pending (will be updated via webhook)
      if (error.response?.data?.error_message === "Endpoint not found") {
        return {
          success: true,
          message: "Payment status pending - awaiting webhook update",
          data: {
            checkoutRequestId,
            status: "pending",
            resultCode: undefined,
            resultDesc: "Status check not available - monitoring via webhook",
            callbackMetadata: null,
          },
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to check payment status",
      };
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn(
        "Webhook secret not configured, skipping signature verification"
      );
      return true;
    }

    // PayHero typically uses HMAC-SHA256 for signature verification
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    return signature === expectedSignature;
  }

  parseWebhookPayload(payload: WebhookPayload): WebhookPayload {
    return {
      transactionId: payload.transactionId,
      amount: payload.amount,
      phoneNumber: payload.phoneNumber,
      status: payload.status,
      accountReference: payload.accountReference,
      transactionDesc: payload.transactionDesc,
      callbackMetadata: payload.callbackMetadata,
    };
  }
}

// Initialize PayHero service
const payHeroConfig: PayHeroConfig = {
  apiUsername: process.env.PAYHERO_API_USERNAME || "your_api_username",
  apiPassword: process.env.PAYHERO_API_PASSWORD || "your_api_password",
  baseUrl:
    process.env.PAYHERO_BASE_URL || "https://backend.payhero.co.ke/api/v2",
  channelId: parseInt(process.env.PAYHERO_CHANNEL_ID || "123"),
  webhookSecret: process.env.PAYHERO_WEBHOOK_SECRET,
};

export const payHeroService = new PayHeroService(payHeroConfig);
export type {
  STKPushRequest,
  STKPushResponse,
  PaymentStatusResponse,
  WebhookPayload,
};
