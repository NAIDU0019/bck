import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("orderId");

    const pollPaymentStatus = async () => {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/payment/phonepe/status/${orderId}`);
        const result = await res.json();

        if (result.message.includes("confirmed")) {
          toast.success("✅ Payment confirmed!");
          // You can redirect or show order summary
          navigate(`/order-summary/${orderId}`);
        } else {
          setTimeout(pollPaymentStatus, 3000); // Retry in 3s
        }
      } catch (error) {
        console.error("❌ Error checking payment:", error);
        toast.error("Failed to check payment status.");
      }
    };

    pollPaymentStatus();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold">Verifying your payment...</h1>
      <p className="mt-4 text-gray-500">Please wait while we confirm your transaction.</p>
    </div>
  );
};

export default PaymentSuccess;
