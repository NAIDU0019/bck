
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";

const CheckoutSuccessPage = () => {
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
              
              <p className="text-muted-foreground mb-8">
                Your order has been confirmed and will be shipped soon. We've sent a confirmation 
                email with your order details and tracking information.
              </p>
              
              <div className="bg-muted p-6 rounded-lg mb-8">
                <h2 className="font-semibold mb-2">What's Next?</h2>
                <ul className="space-y-2 text-left">
                  <li>• You'll receive an email confirmation shortly</li>
                  <li>• We'll notify you once your order ships</li>
                  <li>• You can track your order status online</li>
                  <li>• Estimated delivery time: 3-5 business days</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
                <Button variant="outline">
                  <Link to="/">
                    Return to Home
                  </Link>
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
