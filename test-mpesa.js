const axios = require("axios");

// M-Pesa production credentials (provided by user)
const consumerKey = "Qh3BBbtWUZ7jLSK8gez80ZoI1btiVLxBCs4dBrJAb3TxsYW3";
const consumerSecret =
  "Gu0Tz2OwAln4s5Nb3QoXmYSgDRcZWiXO3JCE8WnTmXADamQGPLFnkGGLBAkeQpMQ";
const shortcode = "174379";
const passkey =
  "bfb279f9aa9bdbcf158e97b8dfe72afccfc019c791c45adaa35d57ae5c18d7af";

// Utility functions
function generateTimestamp() {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0")
  );
}

function generatePassword(shortcode, passkey, timestamp) {
  const data = shortcode + passkey + timestamp;
  return Buffer.from(data).toString("base64");
}

async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  try {
    const response = await axios.get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function testSTKPush() {
  try {
    console.log("🔄 Getting access token...");
    const accessToken = await getAccessToken();
    console.log("✅ Access token obtained successfully");

    const timestamp = generateTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);

    const requestData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 1, // Test with 1 KES
      PartyA: "254712345678", // Test phone number
      PartyB: shortcode,
      PhoneNumber: "254712345678",
      CallBackURL:
        "https://clinton-stack-websites.vercel.app/api/payments/mpesa/callback",
      AccountReference: "TEST-PAYMENT",
      TransactionDesc: "Test Payment - M-Pesa Integration",
    };

    console.log("📤 Initiating STK Push with data:", requestData);

    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🎉 STK Push Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ STK Push Error:", error.response?.data || error.message);
    throw error;
  }
}

// Run the test
testSTKPush()
  .then((result) => {
    console.log("🎯 M-Pesa integration test completed successfully!");
    console.log("📊 Final Result:", result);
  })
  .catch((error) => {
    console.error("💥 M-Pesa integration test failed:", error.message);
    process.exit(1);
  });
