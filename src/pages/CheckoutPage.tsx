import { useState } from "react";
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
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const CheckoutPage = () => {
  const { user, isSignedIn } = useUser();
  const { items, total: contextTotal } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpayButton, setShowRazorpayButton] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

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
    },
  });

  // If cart is empty, show 404-like message
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

  // If user is NOT logged in, show login prompt
  if (!isSignedIn) {
    return (
      <>
        <Head title="Please Login | ADHYAA PICKLES" />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-24 text-center">
            <h1 className="text-4xl font-bold mb-4">Please Login to Continue</h1>
            <p className="mb-6">
              You need to be logged in to place an order. Please login or create an account.
            </p>
            <Button onClick={() => navigate("/sign-up")} className="mr-4">
              Go to Login
            </Button>
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
    } else {
      setTimeout(() => {
        console.log("Order submitted:", { orderData: data, products: items });
        toast.success("Your order has been placed successfully!");
        navigate("/checkout-success");
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.product.pricePerWeight?.[item.weight] || 0;
    return acc + unitPrice * item.quantity;
  }, 0);

  const shippingCost = subtotal > 1000 ? 0 : 100;
  const finalTotal = subtotal + shippingCost;

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
                      <div key={item.product.id} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {weight}g × {formatPrice(price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(total)}</p>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4">
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
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Shipping Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-2"
                            >
                              <div className="flex items-center space-x-2 border p-4 rounded-md">
                                <RadioGroupItem value="razorpay" id="razorpay" />
                                <Label htmlFor="razorpay" className="cursor-pointer flex-grow">
                                  Online Payment (Razorpay)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 border p-4 rounded-md">
                                <RadioGroupItem value="cod" id="cod" />
                                <Label htmlFor="cod" className="cursor-pointer flex-grow">
                                  Cash on Delivery
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {showRazorpayButton ? (
                    <RazorpayCheckout customerInfo={customerInfo} />
                  ) : (
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : `Place Order · ${formatPrice(finalTotal)}`}
                    </Button>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;
