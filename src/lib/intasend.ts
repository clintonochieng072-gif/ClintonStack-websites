import axios from "axios";

interface IntaSendConfig {
  publicKey: string;
  secretKey: string;
  walletId: string;
  baseUrl: string;
}

interface STKPushRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
}

interface STKPushResponse {
  success: boolean;
  message: string;
  data?: {
    transaction_id: string;
    status: string;
    amount: number;
    phone_number: string;
    reference: string;
  };
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    transaction_id: string;
    status: string;
    amount: number;
    phone_number: string;
    reference: string;
    created_at: string;
    updated_at: string;
  };
}

interface PayoutRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
}

interface PayoutResponse {
  success: boolean;
  message: string;
  data?: {
    transaction_id: string;
    status: string;
    amount: number;
    phone_number: string;
    reference: string;
  };
}

class IntaSendService {
  private config: IntaSendConfig;

  constructor(config: IntaSendConfig) {
    this.config = config;
  }

  private getAuthHeaders(): Record<string, string> {
    const scheme = process.env.INTASEND_AUTH_SCHEME || "Bearer";
    // Use secret key for server-to-server API calls by default
    const token = this.config.secretKey || this.config.publicKey;
    return {
      Authorization: `${scheme} ${token}`,
      "Content-Type": "application/json",
    };
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const payload = {
        amount: request.amount,
        phone_number: request.phoneNumber,
        reference: request.reference,
        ...(this.config.walletId ? { wallet_id: this.config.walletId } : {}),
      };

      console.log("IntaSend STK Push Request:");
      console.log(
        "URL:",
        `${this.config.baseUrl}/payment/collection/mpesa-stk-push/`
      );
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.config.baseUrl}/payment/collection/mpesa-stk-push/`,
        payload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log("IntaSend STK Push Response:", response.data);

      return {
        success: true,
        message: "STK Push initiated successfully",
        data: {
          transaction_id: response.data.transaction_id || response.data.id,
          status: response.data.status || "pending",
          amount: response.data.amount,
          phone_number: response.data.phone_number,
          reference: response.data.reference || response.data.api_ref,
        },
      };
    } catch (error: any) {
      console.error("IntaSend STK Push error:");
      console.error("Message:", error.message);
      console.error("Status Code:", error.response?.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response?.data, null, 2)
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to initiate STK Push",
      };
    }
  }

  async verifyPayment(
    transactionId: string
  ): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/payment/status/${transactionId}/`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log("IntaSend Payment Verification Response:", response.data);

      return {
        success: true,
        message: "Payment status retrieved successfully",
        data: {
          transaction_id: response.data.transaction_id || response.data.id,
          status: response.data.status,
          amount: response.data.amount,
          phone_number: response.data.phone_number,
          reference: response.data.reference || response.data.api_ref,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        },
      };
    } catch (error: any) {
      console.error("IntaSend payment verification error:");
      console.error("Message:", error.message);
      console.error("Status Code:", error.response?.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response?.data, null, 2)
      );

      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify payment",
      };
    }
  }

  async initiatePayout(request: PayoutRequest): Promise<PayoutResponse> {
    try {
      const payload = {
        amount: request.amount,
        phone_number: request.phoneNumber,
        reference: request.reference,
        wallet_id: this.config.walletId,
        currency: "KES",
        method: "MPESA-B2C",
      };

      console.log("IntaSend Payout Request:");
      console.log(
        "URL:",
        `${this.config.baseUrl}/payment/disbursement/mpesa-b2c/`
      );
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.config.baseUrl}/payment/disbursement/mpesa-b2c/`,
        payload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log("IntaSend Payout Response:", response.data);

      return {
        success: true,
        message: "Payout initiated successfully",
        data: {
          transaction_id: response.data.transaction_id || response.data.id,
          status: response.data.status || "pending",
          amount: response.data.amount,
          phone_number: response.data.phone_number,
          reference: response.data.reference || response.data.api_ref,
        },
      };
    } catch (error: any) {
      console.error("IntaSend Payout error:");
      console.error("Message:", error.message);
      console.error("Status Code:", error.response?.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response?.data, null, 2)
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to initiate payout",
      };
    }
  }
}

// Initialize IntaSend service
const intaSendConfig: IntaSendConfig = {
  publicKey: process.env.INTASEND_PUBLIC_KEY || "",
  secretKey: process.env.INTASEND_SECRET_KEY || "",
  walletId: process.env.INTASEND_WALLET_ID || "",
  baseUrl: "https://payment.intasend.com/api/v1",
};

export const intaSendService = new IntaSendService(intaSendConfig);
export type {
  STKPushRequest,
  STKPushResponse,
  PaymentVerificationResponse,
  PayoutRequest,
  PayoutResponse,
};
