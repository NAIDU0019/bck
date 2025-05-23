import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Head from "./components/Head";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import NotFound from "./pages/NotFound";
import { SignedIn, SignedOut, RedirectToSignIn, SignUp, SignIn } from "@clerk/clerk-react";
import DashboardPage from "./pages/DashboardPage";
import LogoutPage from "./pages/LogoutPage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create a QueryClient instance for React Query
const queryClient = new QueryClient();

const SignUpCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return <div>Processing sign-up...</div>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Head />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

              {/* Clerk Auth Routes */}
              <Route path="/sign-in/*" element={<SignIn />} />
              <Route path="/sign-up/*" element={<SignUp />} />
              <Route path="/sign-up/sso-callback" element={<SignUpCallback />} />

              {/* Protected Route */}
              <Route
                path="/dashboard"
                element={
                  <>
                    <SignedIn>
                      <DashboardPage />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              {/* Logout Route */}
              <Route path="/logout" element={<LogoutPage />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
