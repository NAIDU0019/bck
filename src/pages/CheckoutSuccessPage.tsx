import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const hasCartBeenCleared = useRef(false);
  const { clearCart } = useCart();

  // ✅ Fetch the order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`);
        const data = await res.json();
        if (data && !data.message) {
          setOrderData(data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  // ✅ Clear cart + auto-redirect
  useEffect(() => {
    if (orderData && !hasCartBeenCleared.current) {
      clearCart();
      hasCartBeenCleared.current = true;
    }

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
  }, [orderData, navigate]);

  const firstName = orderData?.customer_info?.fullName?.split(" ")[0] || "";

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

            {!loading && orderData ? (
              <>
                <p className="text-lg font-semibold text-primary mb-6">
                  Order Total: {formatPrice(orderData.total_amount)}
                </p>

                <section className="bg-muted p-6 rounded-lg mb-8 text-left shadow-md">
                  <h2 className="font-semibold text-xl mb-3">Order Details</h2>
                  <p className="mb-1"><span className="font-medium">Name:</span> {orderData.customer_info.fullName}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {orderData.customer_info.email}</p>
                  <p className="mb-1"><span className="font-medium">Phone:</span> {orderData.customer_info.phoneNumber}</p>
                  <p className="mb-1">
                    <span className="font-medium">Shipping Address:</span> {orderData.customer_info.address}, {orderData.customer_info.city}, {orderData.customer_info.state} - {orderData.customer_info.postalCode}
                  </p>
                  <p className="mb-4">
                    <span className="font-medium">Payment Method:</span> {orderData.payment_method === "cod" ? "Cash on Delivery" : "Online Payment (PhonePe)"}
                  </p>

                  <h3 className="font-semibold text-lg mb-2">Items Purchased:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {orderData.ordered_items.map((item, idx) => (
                      <li key={idx}>
                        {item.product.name} ({item.weight}g) × {item.quantity} – {formatPrice(item.product.pricePerWeight?.[item.weight] * item.quantity)}
                      </li>
                    ))}
                  </ul>
                </section>

                <p className="text-blue-600 font-semibold mb-4">
                  You will be redirected to the home page in <time>{countdown}</time> second{countdown !== 1 && "s"}.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We were unable to retrieve your order details. Please check your email for confirmation. If you have any questions, <a href="mailto:support@adhyaa.com" className="text-blue-600 underline">contact support</a>.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
              <Button asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutSuccessPage;
