import { useEffect, useRef, useState } from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [orderedItems, setOrderedItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const hasCartBeenCleared = useRef(false);

  useEffect(() => {
    const state = location.state;
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    // CASE 1: COD Flow (state available)
    if (state?.customerInfo && state?.orderedItems && state?.orderTotal) {
      setCustomerInfo(state.customerInfo);
      setOrderedItems(state.orderedItems);
      setOrderTotal(state.orderTotal);
      setOrderConfirmed(true);
    }
    // CASE 2: PhonePe Flow (redirected back after payment)
    else if (orderId) {
      const fetchPaymentStatus = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/phonepe/status/${orderId}`);
          const result = await res.json();

          if (result.status === "SUCCESS") {
            const saved = localStorage.getItem("pending_order_data");
            if (saved) {
              const parsed = JSON.parse(saved);

              const orderRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Applied-Coupon": parsed.appliedCoupon?.code || ""
                },
                body: JSON.stringify({
                  orderId,
                  customerInfo: parsed.customerInfo,
                  orderedItems: parsed.orderedItems,
                  orderDetails: parsed.orderDetails,
                  totalAmount: parsed.orderDetails.finalTotal,
                  paymentMethod: "phonepe",
                  paymentId: result.transactionId,
                  paymentStatus: "paid",
                  appliedCoupon: parsed.appliedCoupon
                })
              });

              const finalData = await orderRes.json();
              if (!orderRes.ok) throw new Error(finalData.message || "Order insert failed");

              setCustomerInfo(parsed.customerInfo);
              setOrderedItems(parsed.orderedItems);
              setOrderTotal(parsed.orderDetails.finalTotal);
              setOrderConfirmed(true);
              localStorage.removeItem("pending_order_data");
            }
          } else {
            toast.error("Payment failed or cancelled. Please try again.");
            navigate("/checkout");
          }
        } catch (err) {
          console.error("Payment status check failed:", err);
          toast.error("Unable to confirm payment. Try again later.");
          navigate("/checkout");
        }
      };

      fetchPaymentStatus();
    }
  }, [location.state, navigate]);

  // Clear cart once
  useEffect(() => {
    if (orderConfirmed && !hasCartBeenCleared.current) {
      clearCart();
      hasCartBeenCleared.current = true;
    }

    if (orderConfirmed) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            navigate("/");
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [orderConfirmed, navigate, clearCart]);

  const firstName = customerInfo?.fullName?.split(" ")[0] || "";

  return (
    <>
      <Head title="Order Confirmed - ADHYAA PICKLES" description="Your order has been successfully placed." />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Thank You{firstName ? `, ${firstName}` : ""}! Your Order is Confirmed.
            </h1>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              Your order has been confirmed and will be shipped soon. We've sent a confirmation email with your order details and tracking information.
            </p>

            {orderConfirmed ? (
              <>
                <p className="text-lg font-semibold text-primary mb-6">
                  Order Total: {formatPrice(orderTotal)}
                </p>

                <section className="bg-muted p-6 rounded-lg mb-8 text-left shadow-md" aria-labelledby="order-details-heading">
                  <h2 id="order-details-heading" className="font-semibold text-xl mb-3">
                    Order Details
                  </h2>
                  <p className="mb-1"><span className="font-medium">Name:</span> {customerInfo.fullName}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {customerInfo.email}</p>
                  <p className="mb-1"><span className="font-medium">Phone:</span> {customerInfo.phoneNumber}</p>
                  <p className="mb-1"><span className="font-medium">Shipping Address:</span> {customerInfo.address}, {customerInfo.city}, {customerInfo.state} - {customerInfo.postalCode}</p>
                  <p className="mb-4"><span className="font-medium">Payment Method:</span> {customerInfo.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (PhonePe)"}</p>

                  <h3 className="font-semibold text-lg mb-2">Items Purchased:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {orderedItems.map((item: any) => (
                      <li key={`${item.product.id}-${item.weight}`}>
                        {item.product.name} ({item.weight}g) x {item.quantity} -{" "}
                        {formatPrice(item.product.pricePerWeight?.[item.weight] * item.quantity)}
                      </li>
                    ))}
                  </ul>
                </section>

                <p className="text-blue-600 font-semibold mb-4" aria-live="polite" aria-atomic="true">
                  You will be redirected to the home page in <time>{countdown}</time> second{countdown !== 1 && "s"}.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
                  <Button asChild>
                    <Link to="/products" className="hover:underline">Continue Shopping</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/" className="hover:underline">Return to Home</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We were unable to retrieve your order details. Please check your email for a confirmation. If you have any questions,{" "}
                <a href="mailto:support@adhyaa.com" className="text-blue-600 underline">contact support</a>.
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutSuccessPage;
