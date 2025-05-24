import { useState, useEffect } from "react";
import { Resend } from 'resend';
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/sonner";
import { formatPrice } from "@/lib/utils";
import RazorpayCheckout from "@/components/RazorpayCheckout";

import { saveOrder } from '../lib/supabaseOrders';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const checkoutFormSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(5),
  phoneNumber: z.string().min(10),
  paymentMethod: z.enum(["razorpay", "cod"]),
  savedAddressId: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const TAX_RATE = 0.1; // 10% tax for example
const ADDITIONAL_FEES = 0; // Flat additional fees example

const CheckoutPage = () => {
  const { user, isSignedIn } = useUser();
  const { items, total: contextTotal, updateItemQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpayButton, setShowRazorpayButton] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phoneNumber: "",
      paymentMethod: "cod",
      savedAddressId: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      const addresses = user.publicMetadata?.addresses || [];
      setSavedAddresses(addresses);

      if (addresses.length > 0) {
        const addr = addresses[0];
        form.reset({
          fullName: addr.fullName || user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          address: addr.address || "",
          city: addr.city || "",
          state: addr.state || "",
          postalCode: addr.postalCode || "",
          phoneNumber: addr.phoneNumber || "",
          paymentMethod: "cod",
          savedAddressId: addr.id,
        });
      } else {
        form.setValue("fullName", user.fullName || "");
        form.setValue("email", user.primaryEmailAddress?.emailAddress || "");
      }
    }
  }, [user]);

  const handleSavedAddressChange = (addressId: string) => {
    const addr = savedAddresses.find((a) => a.id === addressId);
    if (addr) {
      form.setValue("fullName", addr.fullName || user.fullName || "");
      form.setValue("email", user.primaryEmailAddress?.emailAddress || "");
      form.setValue("address", addr.address || "");
      form.setValue("city", addr.city || "");
      form.setValue("state", addr.state || "");
      form.setValue("postalCode", addr.postalCode || "");
      form.setValue("phoneNumber", addr.phoneNumber || "");
      form.setValue("savedAddressId", addressId);
    } else {
      form.setValue("savedAddressId", "");
      form.setValue("address", "");
      form.setValue("city", "");
      form.setValue("state", "");
      form.setValue("postalCode", "");
      form.setValue("phoneNumber", "");
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Head title="404 - Page Not Found | ADHYAA PICKLES" />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-24 text-center">
            <h1 className="text-4xl font-bold mb-4">Oops! Page not found</h1>
            <p className="text-muted-foreground mb-6">
              Looks like your cart is empty. Please add something before proceeding to checkout.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate("/")}>Go to Home</Button>
              <Button variant="outline" onClick={() => navigate("/products")}>
                Browse Products
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  

  const onSubmit = (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    if (data.paymentMethod === "razorpay") {
      setCustomerInfo(data);
      setShowRazorpayButton(true);
      setIsSubmitting(false);
    } 
    if (data.paymentMethod === "cod") {
      
  fetch("http://localhost:5000/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      fullName: data.fullName,
      address: data.address,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    phoneNumber: data.phoneNumber,
    paymentMethod: data.paymentMethod,
      orderDetails: { items, total: finalTotal },
    }),
  })
    .then(() => {
      toast.success("Order placed and confirmation email sent!");
      navigate("/checkout-success");
    })
    .catch(() => {
      toast.error("Order placed but failed to send confirmation email.");
      navigate("/checkout-success");
    })
    .finally(() => setIsSubmitting(false));
}
else {
      setTimeout(() => {
        console.log("Order submitted:", { orderData: data, products: items });
        toast.success("Your order has been placed successfully!");
        navigate("/checkout-success");
        setIsSubmitting(false);
      }, 1500);
    }
  };

  // Calculate subtotal
  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.product.pricePerWeight?.[item.weight] || 0;
    return acc + unitPrice * item.quantity;
  }, 0);

  const taxes = subtotal * TAX_RATE;
  const shippingCost = subtotal > 1000 ? 0 : 100;
  const finalTotal = subtotal + taxes + shippingCost + ADDITIONAL_FEES;


  return (
    <>
      <Head title="Checkout - ADHYAA PICKLES" />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1 order-2 lg:order-2">
              <div className="bg-muted p-6 rounded-lg sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-4 mb-4">
                  {items.map((item) => {
                    const weight = item.weight;
                    const price = item.product.pricePerWeight?.[weight] || 0;
                    const total = price * item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {weight}g × {formatPrice(price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = Number(e.target.value);
                              if (qty > 0 && qty <= 99) {
                                updateItemQuantity(item.product.id, qty);
                              }
                            }}
                            className="w-16 border rounded px-2 py-1 text-center"
                          />
                          <p className="font-medium w-20 text-right">
                            {formatPrice(total)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product.id)}
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>{formatPrice(taxes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                  </div>
                  {ADDITIONAL_FEES > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Fees</span>
                      <span>{formatPrice(ADDITIONAL_FEES)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2 order-1 lg:order-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <FormField
                      control={form.control}
                      name="savedAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saved Addresses</FormLabel>
                          <select
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleSavedAddressChange(e.target.value);
                            }}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">Select saved address</option>
                            {savedAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.address}, {addr.city}, {addr.state}
                              </option>
                            ))}
                          </select>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Mumbai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* State */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Maharashtra" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Postal Code */}
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="400001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-6"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="razorpay" id="razorpay" />
                              </FormControl>
                              <FormLabel htmlFor="razorpay" className="cursor-pointer">
                                Razorpay (Online Payment)
                              </FormLabel>
                            </FormItem>

                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="cod" id="cod" />
                              </FormControl>
                              <FormLabel htmlFor="cod" className="cursor-pointer">
                                Cash on Delivery (COD)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Placing order..." : "Place Order"}
                  </Button>
                </form>
              </Form>

              {/* Razorpay Checkout */}
              {showRazorpayButton && customerInfo && (
                <RazorpayCheckout
                  amount={finalTotal}
                  customerInfo={customerInfo}
                  onSuccess={() => {
                    toast.success("Payment successful!");
                    setShowRazorpayButton(false);
                    navigate("/checkout-success");
                  }}
                  onFailure={() => {
                    toast.error("Payment failed. Please try again.");
                    setShowRazorpayButton(false);
                  }}
                />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;
