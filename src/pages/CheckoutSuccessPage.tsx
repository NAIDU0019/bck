import { useEffect, useRef, useState } from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

const CheckoutSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const hasCartBeenCleared = useRef(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/status/${orderId}`);
        const data = await res.json();

        if (data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (order && !hasCartBeenCleared.current) {
      clearCart();
      hasCartBeenCleared.current = true;
    }

    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timerInterval);
          navigate("/");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [order, navigate]);

  const firstName = order?.customer_info?.fullName?.split(" ")[0] || "";

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

            {!loading && order ? (
              <>
                <p className="text-lg font-semibold text-primary mb-6">
                  Order Total: {formatPrice(order.total_amount)}
                </p>

                <section className="bg-muted p-6 rounded-lg mb-8 text-left shadow-md" aria-labelledby="order-details-heading">
                  <h2 id="order-details-heading" className="font-semibold text-xl mb-3">
                    Order Details
                  </h2>
                  <p className="mb-1"><span className="font-medium">Name:</span> {order.customer_info.fullName}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {order.customer_info.email}</p>
                  <p className="mb-1"><span className="font-medium">Phone:</span> {order.customer_info.phoneNumber}</p>
                  <p className="mb-1"><span className="font-medium">Shipping Address:</span> {order.customer_info.address}, {order.customer_info.city}, {order.customer_info.state} - {order.customer_info.postalCode}</p>
                  <p className="mb-4"><span className="font-medium">Payment Method:</span> {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>

                  <h3 className="font-semibold text-lg mb-2">Items Purchased:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {order.ordered_items.map((item, idx) => (
                      <li key={idx}>
                        {item.product?.name} ({item.weight}g) x {item.quantity} -{" "}
                        {formatPrice(item.product?.pricePerWeight?.[item.weight] * item.quantity)}
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
