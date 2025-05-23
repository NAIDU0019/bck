
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

// Add Razorpay to the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

const RazorpayCheckout = ({ customerInfo }: RazorpayCheckoutProps) => {
  const { total, clearCart, items } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsLoading(true);
    
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        initializeRazorpay();
      };
      script.onerror = () => {
        setIsLoading(false);
        toast.error("Failed to load Razorpay. Please try again.");
      };
      document.body.appendChild(script);
    } else {
      initializeRazorpay();
    }
  };

  const initializeRazorpay = () => {
    // In a real implementation, this would come from your backend
    // using the Razorpay API to create an order
    const options = {
      key: "RAZORPAY_KEY_WILL_GO_HERE", // Replace with your actual key when available
      amount: total * 100, // Amount in paisa
      currency: "INR",
      name: "ADHYAA PICKLES",
      description: `Order of ${items.length} ${items.length === 1 ? 'item' : 'items'}`,
      image: "/favicon.ico",
      handler: function(response: any) {
        // Handle the success
        console.log("Payment successful", response);
        
        // In production, verify the payment on your backend
        // Then proceed to order creation
        
        saveOrderToDatabase(response.razorpay_payment_id);
      },
      prefill: {
        name: customerInfo.fullName,
        email: customerInfo.email,
        contact: customerInfo.phoneNumber
      },
      notes: {
        address: customerInfo.address
      },
      theme: {
        color: "#4A7E59" // pickle-700 color
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      console.error("Payment failed", response.error);
      toast.error("Payment failed: " + response.error.description);
      setIsLoading(false);
    });

    rzp.open();
    setIsLoading(false);
  };

  const saveOrderToDatabase = (paymentId: string) => {
    // Here you would make a call to your Supabase backend to save the order
    // For now, we'll simulate success
    
    setTimeout(() => {
      // Clear the cart and navigate to success page
      clearCart();
      navigate("/checkout-success");
    }, 1000);
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? "Processing..." : `Pay Now · ${formatPrice(total > 1000 ? total : total + 100)}`}
    </Button>
  );
};

export default RazorpayCheckout;
