import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BadgeVeg } from "@/components/ui/badge-veg";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus, ChevronLeft, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { products } from "@/data/products";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === id);
  const [selectedWeight, setSelectedWeight] = useState<string>(product ? Object.keys(product.pricePerWeight)[0] : "");

  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [canReview, setCanReview] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const user = supabase.auth.user();
  const userId = user?.id;
  const author = user?.user_metadata?.full_name || "Anonymous";

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (data) {
        setReviews(data);
        const total = data.reduce((acc, r) => acc + r.rating, 0);
        const avg = data.length ? total / data.length : Math.random() * (5 - 4) + 4;
        setAverageRating(Number(avg.toFixed(1)));
      }
    };

    const verifyOrder = async () => {
      if (!userId || !id) return;
      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", userId)
        .contains("products", [id])
        .limit(1)
        .single();

      if (data && !error) {
        setCanReview(true);
        setOrderId(data.id);
      } else {
        setCanReview(false);
        setOrderId(null);
      }
    };

    if (product) {
      fetchReviews();
      verifyOrder();
    }
  }, [id, product, userId]);

  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      toast.error("Please provide rating and comment.");
      return;
    }
    if (!orderId) {
      toast.error("You must have ordered this product to review.");
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          product_id: id,
          order_id: orderId,
          rating,
          comment,
          author,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      toast.error("Failed to submit review.");
    } else {
      toast.success("Review submitted!");
      setReviews([data, ...reviews]);
      setRating(0);
      setComment("");
    }

    setSubmitting(false);
  };

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `https://www.adhyaapickles.in${product.image}`,
    description: product.description,
    brand: { "@type": "Brand", name: "Adhyaa Pickles" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.pricePerWeight[selectedWeight],
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const decreaseQuantity = () => quantity > 1 && setQuantity(quantity - 1);
  const increaseQuantity = () => setQuantity(quantity + 1);

  const handleAddToCart = () => {
    addItem(product, selectedWeight, quantity);
    toast.success(`${quantity} x ${product.name} (${selectedWeight}g) added to cart!`);
  };

  const handleBuyNow = () => {
    addItem(product, selectedWeight, quantity);
    toast.success(`Redirecting to checkout...`);
    setTimeout(() => navigate("/checkout"), 1000);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} - ADHYAA PICKLES</title>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-md" />
              </div>
              <div>
                <BadgeVeg variant={product.type} className="mb-3" />
                <h1 className="text-3xl font-display font-bold mb-2">{product.name}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>

                <div className="mb-4">
                  <label className="font-medium block mb-2">Select Weight:</label>
                  <div className="flex gap-2">
                    {Object.entries(product.pricePerWeight).map(([weight]) => (
                      <Button
                        key={weight}
                        variant={selectedWeight === weight ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedWeight(weight)}
                      >
                        {weight}g
                      </Button>
                    ))}
                  </div>
                </div>

                <p className="text-2xl font-semibold mb-6">{formatPrice(product.pricePerWeight[selectedWeight])}</p>
                <p className="text-muted-foreground mb-6">{product.description}</p>

                <Separator className="my-6" />

                <div className="mb-6">
                  <p className="font-medium mb-2">Quantity</p>
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-4">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={increaseQuantity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Reviews Tab */}
            <Tabs defaultValue="reviews">
              <TabsList>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="reviews" className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b pb-4">
                        <div className="flex mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="font-semibold text-sm">{r.author}</p>
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                )}

                {canReview ? (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Leave a Review</h4>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setRating(star)}
                          className={`h-5 w-5 cursor-pointer ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded mb-2"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your thoughts..."
                    />
                    <Button onClick={handleSubmitReview} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                ) : (
                  <p className="italic text-sm mt-4 text-muted-foreground">
                    Only verified customers can leave a review.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProductDetailPage;
