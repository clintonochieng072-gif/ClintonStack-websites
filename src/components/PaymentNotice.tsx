"use client";

interface PaymentNoticeProps {
  onClose: () => void;
}

const PaymentNotice = ({ onClose }: PaymentNoticeProps) => {
  const handlePayNow = () => {
    alert(
      `M-Pesa Payment Instructions:\n\n1. Open M-Pesa on your phone\n2. Tap "Send Money"\n3. Enter Payee Number: 254745408764\n4. Enter Amount: 5\n5. Enter your M-Pesa PIN and send\n\nAfter sending, contact the admin via WhatsApp or Call to confirm payment.`
    );
  };

  const handleCallAdmin = () => {
    window.location.href = "tel:+254745408764";
  };

  const handleMessageAdmin = () => {
    const message = encodeURIComponent(
      "Hello, I've just sent my subscription payment. Kindly activate my account."
    );
    window.open(`https://wa.me/254745408764?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Editing Trial Ended</h2>
        <p className="mb-4">
          Your editing trial has ended. To unlock full editing access, please
          pay a one-time subscription fee of <strong>KES 5</strong>.
        </p>
        <p className="mb-4">
          Send KES 5 via M-Pesa to <strong>254745408764</strong>.
        </p>
        <p className="mb-6">
          After payment, contact admin to activate your account manually.
        </p>
        <div className="flex flex-col gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handlePayNow}
          >
            Pay Now
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleCallAdmin}
          >
            Call Admin
          </button>
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            onClick={handleMessageAdmin}
          >
            Message Admin
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-4"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentNotice;
