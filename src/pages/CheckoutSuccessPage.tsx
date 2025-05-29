import { useEffect, useRef, useState } from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customerInfo, orderedItems, orderTotal } = location.state || {};
  const { clearCart } = useCart();

  const hasCartBeenCleared = useRef(false);
  const [countdown, setCountdown] = useState(30); // 30 seconds before redirect

  useEffect(() => {
    if (customerInfo && orderedItems && orderTotal && !hasCartBeenCleared.current) {
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
  }, [customerInfo, orderedItems, orderTotal, navigate]);

  return (
    <>
      <Head
        title="Order Confirmed - ADHYAA PICKLES"
        description="Your order has been successfully placed."
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Thank You For Your Order!
            </h1>

            <p className="text-muted-foreground mb-4">
              Your order has been confirmed and will be shipped soon. We've sent a confirmation email with your order details and tracking information.
            </p>

            {customerInfo && orderedItems && orderTotal ? (
              <>
                <p className="text-lg font-semibold text-primary mb-6">
                  Order Total: {formatPrice(orderTotal)}
                </p>

                <div className="bg-muted p-6 rounded-lg mb-8 text-left">
                  <h2 className="font-semibold text-xl mb-3">Order Details</h2>
                  <p className="mb-1"><span className="font-medium">Name:</span> {customerInfo.fullName}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {customerInfo.email}</p>
                  <p className="mb-1"><span className="font-medium">Phone:</span> {customerInfo.phoneNumber}</p>
                  <p className="mb-1"><span className="font-medium">Shipping Address:</span> {customerInfo.address}, {customerInfo.city}, {customerInfo.state} - {customerInfo.postalCode}</p>
                  <p className="mb-4"><span className="font-medium">Payment Method:</span> {customerInfo.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (Razorpay)"}</p>

                  <h3 className="font-semibold text-lg mb-2">Items Purchased:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {orderedItems.map((item: any) => (
                      <li key={`${item.product.id}-${item.weight}`}>
                        {item.product.name} ({item.weight}g) x {item.quantity} -{" "}
                        {formatPrice(item.product.pricePerWeight?.[item.weight] * item.quantity)}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-blue-600 font-semibold mb-4">
                  You will be redirected to the home page in {countdown} second{countdown !== 1 && "s"}.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
                  <Button asChild>
                    <Link to="/products">Continue Shopping</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-8">
                  We were unable to retrieve your order details directly. Please check your email for a confirmation, which should arrive shortly. If you have any questions, feel free to contact our support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link to="/products">Continue Shopping</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutSuccessPage;
