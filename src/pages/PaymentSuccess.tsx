import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("orderId");

    const pollPaymentStatus = async () => {
      if (!orderId) return;
      try {
        const res = await fetch(`https://bck-d1ip.onrender.com/api/payment/phonepe/status/${orderId}`);
        const result = await res.json();

        if (result.message.includes("confirmed")) {
          toast.success("✅ Payment confirmed!");
          navigate(`/order-summary/${orderId}`);
        } else {
          setTimeout(pollPaymentStatus, 3000); // Retry in 3 seconds
        }
      } catch (error) {
        console.error("❌ Error checking payment:", error);
        toast.error("❌ Failed to check payment status.");
      }
    };

    pollPaymentStatus();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold">Verifying your payment...</h1>
      <p className="mt-3 text-gray-600">Please wait while we confirm your transaction.</p>
    </div>
  );
};

export default PaymentSuccess;
