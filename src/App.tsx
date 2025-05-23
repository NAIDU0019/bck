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
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";


// Create a QueryClient instance for React Query
const queryClient = new QueryClient();

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

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <SignedIn>
                    <DashboardPage />
                  </SignedIn>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                }
              />

              {/* Authentication Page */}
              <Route path="/sign-in/*" element={<AuthPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
